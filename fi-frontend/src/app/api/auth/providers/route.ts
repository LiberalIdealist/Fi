import { getProviders } from "next-auth/react"
import { NextResponse } from "next/server"

export async function GET() {
  const providers = await getProviders()
  return NextResponse.json(providers)
}