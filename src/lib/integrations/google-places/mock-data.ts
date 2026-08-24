export type MockPlace = {
  placeId: string;
  name: string;
  category: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  website: string;
  rating: number;
  reviewCount: number;
  lat: number;
  lng: number;
};

// Deterministic, realistic seed data spanning the industries the product targets.
// Used only when GOOGLE_PLACES_API_KEY is unset — every mock result is tagged `mock: true`.
export const MOCK_PLACES: MockPlace[] = [
  { placeId: "mock-abc-restaurant-dubai", name: "ABC Restaurant", category: "Restaurant", address: "Sheikh Zayed Rd", city: "Dubai, UAE", country: "UAE", phone: "+971 4 555 0101", website: "https://abcrestaurant.example.com", rating: 4.7, reviewCount: 1284, lat: 25.2048, lng: 55.2708 },
  { placeId: "mock-velvet-bean-cafe", name: "Velvet Bean Cafe", category: "Cafe", address: "12 Marina Walk", city: "Dubai, UAE", country: "UAE", phone: "+971 4 555 0140", website: "https://velvetbean.example.com", rating: 4.5, reviewCount: 612, lat: 25.0805, lng: 55.1403 },
  { placeId: "mock-grand-palm-hotel", name: "Grand Palm Hotel", category: "Hotel", address: "Corniche Road", city: "Abu Dhabi, UAE", country: "UAE", phone: "+971 2 555 0177", website: "https://grandpalm.example.com", rating: 4.6, reviewCount: 3021, lat: 24.4539, lng: 54.3773 },
  { placeId: "mock-luxe-hair-studio", name: "Luxe Hair Studio", category: "Salon", address: "45 Jumeirah St", city: "Dubai, UAE", country: "UAE", phone: "+971 4 555 0192", website: "https://luxehair.example.com", rating: 4.8, reviewCount: 894, lat: 25.2285, lng: 55.2593 },
  { placeId: "mock-serenity-spa-riyadh", name: "Serenity Spa", category: "Spa", address: "King Fahd Rd", city: "Riyadh, Saudi Arabia", country: "Saudi Arabia", phone: "+966 11 555 0123", website: "https://serenityspa.example.com", rating: 4.4, reviewCount: 431, lat: 24.7136, lng: 46.6753 },
  { placeId: "mock-brightsmile-dental", name: "BrightSmile Dental Clinic", category: "Dentist", address: "22 Al Wasl Rd", city: "Dubai, UAE", country: "UAE", phone: "+971 4 555 0165", website: "https://brightsmile.example.com", rating: 4.9, reviewCount: 762, lat: 25.1972, lng: 55.2477 },
  { placeId: "mock-cityhealth-clinic", name: "CityHealth Medical Clinic", category: "Clinic", address: "8 Al Khaleej St", city: "Sharjah, UAE", country: "UAE", phone: "+971 6 555 0111", website: "https://cityhealth.example.com", rating: 4.3, reviewCount: 528, lat: 25.3463, lng: 55.4209 },
  { placeId: "mock-ironcore-gym", name: "IronCore Fitness Gym", category: "Gym", address: "9 Sports City Ave", city: "Dubai, UAE", country: "UAE", phone: "+971 4 555 0188", website: "https://ironcore.example.com", rating: 4.6, reviewCount: 1042, lat: 25.0374, lng: 55.2201 },
  { placeId: "mock-skyline-realty", name: "Skyline Realty Group", category: "Real Estate", address: "Business Bay Tower 3", city: "Dubai, UAE", country: "UAE", phone: "+971 4 555 0199", website: "https://skylinerealty.example.com", rating: 4.5, reviewCount: 356, lat: 25.1857, lng: 55.2708 },
  { placeId: "mock-primeauto-service", name: "PrimeAuto Service Center", category: "Automotive", address: "Al Quoz Industrial 3", city: "Dubai, UAE", country: "UAE", phone: "+971 4 555 0133", website: "https://primeauto.example.com", rating: 4.2, reviewCount: 689, lat: 25.1412, lng: 55.2278 },
  { placeId: "mock-urban-retail-store", name: "Urban Living Retail Store", category: "Retail", address: "Mall of the Emirates", city: "Dubai, UAE", country: "UAE", phone: "+971 4 555 0177", website: "https://urbanliving.example.com", rating: 4.1, reviewCount: 214, lat: 25.1181, lng: 55.2003 },
  { placeId: "mock-northstar-legal", name: "Northstar Legal Advisors", category: "Professional Services", address: "DIFC Gate Village", city: "Dubai, UAE", country: "UAE", phone: "+971 4 555 0155", website: "https://northstarlegal.example.com", rating: 4.7, reviewCount: 178, lat: 25.2138, lng: 55.2822 },
];

export function searchMockPlaces(query: string): MockPlace[] {
  const q = query.trim().toLowerCase();
  if (!q) return MOCK_PLACES.slice(0, 8);
  const scored = MOCK_PLACES.map((place) => {
    const haystack = `${place.name} ${place.category} ${place.city}`.toLowerCase();
    const score = haystack.includes(q) ? 2 : q.split(" ").some((word) => haystack.includes(word)) ? 1 : 0;
    return { place, score };
  }).filter((entry) => entry.score > 0);

  if (scored.length === 0) return MOCK_PLACES.slice(0, 6);
  return scored.sort((a, b) => b.score - a.score).map((entry) => entry.place);
}
