import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/generate-portfolio"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;

  // Allow static files to load properly
  if (pathname.startsWith("/_next/") || pathname.startsWith("/favicon.ico") || pathname.startsWith("/logo.png")) {
    return NextResponse.next();
  }

  // Redirect to signin if user is not authenticated
  if (protectedRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL("/signin", req.url)); // Changed from "/auth/signin/"
  }

  return NextResponse.next();
}

// Ensure middleware applies to all routes
export const config = {
  matcher: "/:path*",
};