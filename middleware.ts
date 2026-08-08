import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/calendar/:path*",
    "/analytics/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/profile/:path*",
  ],
};
