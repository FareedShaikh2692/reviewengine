import NextAuth from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { env, isMock } from "@/lib/env";
import { encryptSecret } from "@/lib/crypto";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email-not-verified";
}

const providers: Provider[] = [
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;
      if (!email || !password) return null;

      const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user?.passwordHash) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      if (!user.emailVerified) {
        throw new EmailNotVerifiedError();
      }

      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
];

if (!isMock.googleOAuth) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        // Encrypted at rest — reused later to connect the business's Google integration
        // without asking the user to grant OAuth consent a second time.
        const tokenFields = {
          googleAccessTokenEnc: account.access_token ? encryptSecret(account.access_token) : undefined,
          googleRefreshTokenEnc: account.refresh_token ? encryptSecret(account.refresh_token) : undefined,
          googleTokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
        };

        const existing = await db.user.findUnique({ where: { email: user.email } });
        if (!existing) {
          await db.user.create({
            data: {
              email: user.email,
              name: user.name ?? undefined,
              image: user.image ?? undefined,
              emailVerified: new Date(),
              ...tokenFields,
            },
          });
        } else {
          await db.user.update({
            where: { id: existing.id },
            data: { emailVerified: existing.emailVerified ?? new Date(), ...tokenFields },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await db.user.findUnique({ where: { email: user.email } });
        if (dbUser) {
          token.userId = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
