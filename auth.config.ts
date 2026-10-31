import type { NextAuthConfig } from "next-auth";

// Edge-safe config — no Node.js imports (no bcrypt, mongoose, etc.)
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [], // providers with DB calls are added only in auth.ts
  trustHost: true,
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-paise.session-token"
        : "paise.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    authorized({ auth }) { return !!auth; },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: "USER" | "ADMIN" }).role as "USER" | "ADMIN" | undefined;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        (session.user as { role?: "USER" | "ADMIN" }).role = token.role as "USER" | "ADMIN" | undefined;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
};
