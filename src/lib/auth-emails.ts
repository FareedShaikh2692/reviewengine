import crypto from "node:crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/integrations/email";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function sendVerificationEmail(email: string) {
  const token = generateToken();
  await db.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });
  const link = `${env.APP_URL}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
  await sendEmail({
    to: email,
    subject: "Verify your Review Engine account",
    html: `<p>Welcome to Review Engine! Confirm your email to get started:</p><p><a href="${link}">${link}</a></p>`,
    text: `Welcome to Review Engine! Confirm your email: ${link}`,
  });
  return { token };
}

export async function sendPasswordResetEmail(userId: string, email: string) {
  const token = generateToken();
  await db.passwordResetToken.create({
    data: { userId, token, expires: new Date(Date.now() + 60 * 60 * 1000) },
  });
  const link = `${env.APP_URL}/auth/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Reset your Review Engine password",
    html: `<p>Click below to reset your password. This link expires in 1 hour.</p><p><a href="${link}">${link}</a></p>`,
    text: `Reset your password: ${link}`,
  });
  return { token };
}
