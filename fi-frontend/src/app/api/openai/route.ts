import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";

// OpenAI API endpoint
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }
    
    // Get the request data
    const { prompt, systemPrompt, options } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }
    
    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }
    
    // Prepare the request to OpenAI
    const messages = [
      {
        role: "system",
        content: systemPrompt || "You are a helpful financial assistant."
      },
      {
        role: "user",
        content: prompt
      }
    ];
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || "gpt-4o",
        messages: messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2500,
        top_p: options?.topP || 1,
        frequency_penalty: options?.frequencyPenalty || 0,
        presence_penalty: options?.presencePenalty || 0,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      return NextResponse.json(
        { error: `OpenAI API error: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      text: data.choices[0].message.content,
      usage: data.usage
    });
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}