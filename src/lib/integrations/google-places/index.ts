import { env, isMock } from "@/lib/env";
import { MOCK_PLACES, searchMockPlaces, type MockPlace } from "./mock-data";
import { MOCK_NEW_REVIEWS } from "./mock-reviews";

export type BusinessSearchResult = {
  placeId: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phone: string | null;
  website: string | null;
  rating: number;
  reviewCount: number;
  lat: number | null;
  lng: number | null;
  isMock: boolean;
};

function fromMock(place: MockPlace): BusinessSearchResult {
  return {
    placeId: place.placeId,
    name: place.name,
    category: place.category,
    address: `${place.address}, ${place.city}`,
    city: place.city,
    phone: place.phone,
    website: place.website,
    rating: place.rating,
    reviewCount: place.reviewCount,
    lat: place.lat,
    lng: place.lng,
    isMock: true,
  };
}

/** Google Places API (New) Text Search — falls back to seeded mock data without an API key. */
export async function searchBusinesses(query: string): Promise<BusinessSearchResult[]> {
  if (isMock.google) {
    return searchMockPlaces(query).map(fromMock);
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.location",
    },
    body: JSON.stringify({ textQuery: query }),
  });

  if (!res.ok) {
    throw new Error(`Google Places search failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    places?: Array<{
      id: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      internationalPhoneNumber?: string;
      websiteUri?: string;
      rating?: number;
      userRatingCount?: number;
      primaryTypeDisplayName?: { text?: string };
      location?: { latitude?: number; longitude?: number };
    }>;
  };

  return (data.places ?? []).map((place) => ({
    placeId: place.id,
    name: place.displayName?.text ?? "Unknown business",
    category: place.primaryTypeDisplayName?.text ?? "Business",
    address: place.formattedAddress ?? "",
    city: place.formattedAddress ?? "",
    phone: place.internationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    rating: place.rating ?? 0,
    reviewCount: place.userRatingCount ?? 0,
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
    isMock: false,
  }));
}

export async function getBusinessDetails(placeId: string): Promise<BusinessSearchResult | null> {
  if (isMock.google) {
    const place = MOCK_PLACES.find((p) => p.placeId === placeId);
    return place ? fromMock(place) : null;
  }

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,internationalPhoneNumber,websiteUri,rating,userRatingCount,primaryTypeDisplayName,location",
    },
  });

  if (!res.ok) return null;

  const place = (await res.json()) as {
    id: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    internationalPhoneNumber?: string;
    websiteUri?: string;
    rating?: number;
    userRatingCount?: number;
    primaryTypeDisplayName?: { text?: string };
    location?: { latitude?: number; longitude?: number };
  };

  return {
    placeId: place.id,
    name: place.displayName?.text ?? "Unknown business",
    category: place.primaryTypeDisplayName?.text ?? "Business",
    address: place.formattedAddress ?? "",
    city: place.formattedAddress ?? "",
    phone: place.internationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    rating: place.rating ?? 0,
    reviewCount: place.userRatingCount ?? 0,
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
    isMock: false,
  };
}

export type FetchedReview = {
  externalId: string;
  reviewerName: string;
  rating: number;
  content: string | null;
  reviewDate: Date;
  isMock: boolean;
};

/**
 * Google Places API (New) Place Details "reviews" field returns up to 5 recent reviews per place.
 * Without an API key, returns a small rotating set of plausible new reviews so the sync flow is
 * demonstrable end-to-end without a real integration.
 */
export async function fetchPlaceReviews(placeId: string): Promise<FetchedReview[]> {
  if (isMock.google) {
    return MOCK_NEW_REVIEWS.map((r) => ({
      externalId: `mock:${placeId}:${r.reviewerName}:${r.daysAgo}`,
      reviewerName: r.reviewerName,
      rating: r.rating,
      content: r.content,
      reviewDate: new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000),
      isMock: true,
    }));
  }

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "reviews",
    },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    reviews?: Array<{
      rating?: number;
      text?: { text?: string };
      publishTime?: string;
      authorAttribution?: { displayName?: string };
    }>;
  };

  return (data.reviews ?? []).map((r) => {
    const publishTime = r.publishTime ?? new Date().toISOString();
    const reviewerName = r.authorAttribution?.displayName ?? "Google user";
    return {
      externalId: `google:${placeId}:${reviewerName}:${publishTime}`,
      reviewerName,
      rating: r.rating ?? 5,
      content: r.text?.text ?? null,
      reviewDate: new Date(publishTime),
      isMock: false,
    };
  });
}

/** Deterministic, seeded rating-distribution generator so the preview page has believable data for mock businesses. */
export function ratingDistributionFor(rating: number, total: number) {
  const weights = rating >= 4.5 ? [0.82, 0.12, 0.03, 0.015, 0.015] : rating >= 4.0 ? [0.6, 0.22, 0.1, 0.05, 0.03] : [0.35, 0.25, 0.2, 0.12, 0.08];
  const [five, four, three, two, one] = weights.map((w) => Math.round(w * total));
  return { five, four, three, two, one };
}
