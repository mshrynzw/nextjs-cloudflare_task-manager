import type { NextAuthConfig } from "next-auth";

const protectedPrefixes = [
  "/dashboard",
  "/projects",
  "/tasks",
  "/calendar",
  "/analytics",
  "/notifications",
  "/settings",
  "/profile",
];

const isProd = process.env.NODE_ENV === "production";

/**
 * Edge-compatible Auth.js config used by middleware.
 * Database adapter and Credentials live in auth.ts (Node runtime).
 */
export const authConfig = {
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 14,
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  cookies: {
    sessionToken: {
      name: isProd
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user);
      const isProtected = protectedPrefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      );
      const isLoginPage = pathname === "/login";

      if (isProtected) {
        return isLoggedIn;
      }

      if (isLoginPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
