import { NextRequest, NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authOptions } from "./auth.config"

// NextAuth returns a request handler, but not always typed for Next.js 13
const nextAuthHandler = NextAuth(authOptions)

export const GET = nextAuthHandler
export const POST = nextAuthHandler
