import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    // Get analysis data from request body
    const { 
      documentId, 
      analysisData,
      keyPoints = [],
      anomalies = [],
      actionItems = []
    } = await request.json();
    
    if (!documentId || !analysisData) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }
    
    // Verify the document belongs to the user
    const document = await prisma.financialDocument.findFirst({
      where: {
        id: documentId,
        userId: session.user.id
      }
    });
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Save or update the analysis
    const analysis = await prisma.financialDocumentAnalysis.upsert({
      where: { 
        documentId 
      },
      update: {
        analysisData,
        keyPoints,
        anomalies,
        actionItems,
        updatedAt: new Date()
      },
      create: {
        documentId,
        analysisData,
        keyPoints,
        anomalies,
        actionItems
      }
    });
    
    return NextResponse.json({
      success: true,
      analysisId: analysis.id
    });
  } catch (error) {
    console.error('Error saving document analysis:', error);
    return NextResponse.json(
      { error: 'Failed to save analysis' },
      { status: 500 }
    );
  }
}