import { NextRequest, NextResponse } from 'next/server';
import { generateFollowUpQuestions } from '@/utils/gemini';

export async function POST(request: NextRequest) {
  try {
    const { userAnswers } = await request.json();
    
    if (!userAnswers) {
      return NextResponse.json(
        { error: 'No user answers provided' },
        { status: 400 }
      );
    }
    
    const questions = await generateFollowUpQuestions(userAnswers);
    
    return NextResponse.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate follow-up questions' },
      { status: 500 }
    );
  }
}