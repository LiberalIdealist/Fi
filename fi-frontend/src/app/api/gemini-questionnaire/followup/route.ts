import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { prisma } from '@/lib/prisma';

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

    // Get initial answers and follow-up answers from request body
    const { initialAnswers, followUpAnswers } = await req.json();

    // Merge answers
    const combinedAnswers = {
      ...initialAnswers,
      ...followUpAnswers
    };

    // Save answers to Prisma
    if (user.financialProfile) {
      await prisma.financialProfile.update({
        where: { id: user.financialProfile.id },
        data: { 
          responses: combinedAnswers,
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.financialProfile.create({
        data: {
          userId: user.id,
          responses: combinedAnswers
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing follow-up responses:', error);
    return NextResponse.json({ error: 'Failed to process follow-up responses' }, { status: 500 });
  }
}