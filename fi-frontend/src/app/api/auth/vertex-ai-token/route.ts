import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GoogleAuth } from 'google-auth-library';

export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    // Production authentication using Google Auth Library
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
      // If running on Google Cloud, this will use the service account credentials
      // Otherwise, provide key file location or credentials
      // keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
    
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    
    if (!token?.token) {
      throw new Error('Failed to obtain Google Cloud token');
    }
    
    return NextResponse.json({ token: token.token });

  } catch (error) {
    console.error('Error getting Vertex AI token:', error);
    return NextResponse.json(
      { error: 'Failed to get authentication token' }, 
      { status: 500 }
    );
  }
}