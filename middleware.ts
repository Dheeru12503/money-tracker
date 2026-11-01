import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (req.auth && (pathname === "/login" || pathname === "/register")) {
    const role = (req.auth.user as { role?: string } | undefined)?.role;
    return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/dashboard", req.url));
  }

  if (!req.auth && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  if (req.auth && pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = { matcher: ["/login", "/register", "/dashboard/:path*", "/admin/:path*"] };
