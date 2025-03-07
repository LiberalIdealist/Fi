import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    
    // API URL from env var or fallback
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://wealthme-19942791895.asia-south1.run.app';
    
    const response = await fetch(`${apiUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Sign up failed' }, { status: response.status });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: data.user 
    });
  } catch (error: any) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}