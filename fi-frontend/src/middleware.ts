import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const session = req.cookies.get("next-auth.session-token"); // Ensure this cookie is actually being set

  if (!session && url.pathname.startsWith("/dashboard")) {
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ✅ Correct matcher paths for Next.js Middleware
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // Use route patterns, not file paths
};
