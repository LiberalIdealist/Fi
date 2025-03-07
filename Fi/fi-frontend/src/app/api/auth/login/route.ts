import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // API URL from env var or fallback
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://wealthme-19942791895.asia-south1.run.app';
    
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Login failed' }, { status: response.status });
    }
    
    return NextResponse.json({ 
      token: data.token,
      user: data.user 
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}