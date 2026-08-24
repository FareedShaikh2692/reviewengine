import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().min(1),
  APP_URL: z.string().min(1),
  INTEGRATION_TOKEN_ENCRYPTION_KEY: z.string().min(1),

  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_PLACES_API_KEY: z.string().optional().default(""),

  RESEND_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().optional().default("Review Engine <notifications@reviewengine.app>"),

  TWILIO_ACCOUNT_SID: z.string().optional().default(""),
  TWILIO_AUTH_TOKEN: z.string().optional().default(""),
  TWILIO_SMS_FROM: z.string().optional().default(""),
  TWILIO_WHATSAPP_FROM: z.string().optional().default(""),

  ANTHROPIC_API_KEY: z.string().optional().default(""),

  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  STRIPE_PUBLISHABLE_KEY: z.string().optional().default(""),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  APP_URL: process.env.APP_URL,
  INTEGRATION_TOKEN_ENCRYPTION_KEY: process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_SMS_FROM: process.env.TWILIO_SMS_FROM,
  TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
});

export const isMock = {
  google: !env.GOOGLE_PLACES_API_KEY,
  googleOAuth: !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET,
  email: !env.RESEND_API_KEY,
  sms: !env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN,
  ai: !env.ANTHROPIC_API_KEY,
  billing: !env.STRIPE_SECRET_KEY,
};
