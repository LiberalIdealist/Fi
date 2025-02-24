import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextAuth(authConfig)(req, {
    params: {
      nextauth: req.nextUrl.pathname.split('/').slice(3),
    },
  });
}

export async function POST(req: NextRequest) {
  return NextAuth(authConfig)(req, {
    params: {
      nextauth: req.nextUrl.pathname.split('/').slice(3),
    },
  });
}
