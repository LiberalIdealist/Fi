import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { financialProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get answers from request body
    const { answers } = await req.json();

    // Save answers to Prisma whether or not we had a financial profile already
    let financialProfile = user.financialProfile;
    
    if (financialProfile) {
      await prisma.financialProfile.update({
        where: { id: financialProfile.id },
        data: { 
          responses: answers,
          updatedAt: new Date()
        }
      });
    } else {
      financialProfile = await prisma.financialProfile.create({
        data: {
          userId: user.id,
          responses: answers
        }
      });
    }

    // Check if we need follow-up questions using Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      You are a financial advisor. Based on the following questionnaire answers, determine if you need any follow-up questions to understand the user's financial situation better. The goal is to provide a comprehensive financial profile analysis.
      
      Here are the answers:
      ${Object.entries(answers).map(([question, answer]) => `${question}: ${answer}`).join('\n')}
      
      If you need more information, provide exactly 3 specific follow-up questions. 
      If the information is sufficient, return an empty array.
      
      Format your response as a JSON array of questions:
      ["Question 1?", "Question 2?", "Question 3?"]
      
      Only include the JSON array in your response, nothing else.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the response to get follow-up questions
    let followUpQuestions: string[] = [];
    try {
      followUpQuestions = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing follow-up questions:', e);
    }

    return NextResponse.json({
      success: true,
      followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : []
    });
  } catch (error) {
    console.error('Error processing questionnaire:', error);
    return NextResponse.json({ error: 'Failed to process questionnaire' }, { status: 500 });
  }
}