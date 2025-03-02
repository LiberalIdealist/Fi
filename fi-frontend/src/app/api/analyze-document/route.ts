import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { extractTextFromPDF } from "@/utils/pdfExtractor";
import { analyzePdfContent } from "@/utils/naturalLanguageService";
import { PROCESSING_STATUS } from "@/constants/appConstants";
import { Storage } from '@google-cloud/storage';

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

    // Get documentId from request
    const { documentId, documentType } = await request.json();
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'No document ID provided' },
        { status: 400 }
      );
    }
    
    // Fetch document from database
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
    
    // Update processing status
    await prisma.financialDocument.update({
      where: { id: documentId },
      data: { processingStatus: PROCESSING_STATUS.PROCESSING }
    });
    
    try {
      // Initialize Google Cloud Storage client
      const storage = new Storage();
      const bucket = storage.bucket(document.bucketName);
      const file = bucket.file(document.fileName);

      // Download file from storage
      const [fileBuffer] = await file.download();
      const fileBlob = new Blob([fileBuffer], { type: "application/pdf" });
      const fileObject = new File([fileBlob], document.fileName, { type: "application/pdf" });
      
      // Get any secure data like password
      let password = null;
      if (document.isPasswordProtected) {
        const tempData = await prisma.tempDocumentData.findFirst({
          where: {
            documentId,
            dataKey: "password"
          }
        });
        
        if (tempData) {
          password = tempData.dataValue;
        }
      }
      
      // Extract text from PDF
      const formData = new FormData();
      formData.append('file', fileObject);
      if (password) {
        formData.append('password', password);
      }
      
      const extractResponse = await fetch(new Request('/api/extract-pdf-text', {
        method: 'POST',
        body: formData
      }));
      
      if (!extractResponse.ok) {
        throw new Error(`Failed to extract text: ${extractResponse.status} - ${extractResponse.statusText}`);
      }
      
      const { text } = await extractResponse.json();
      
      // Analyze with Natural Language API
      const analysis = await analyzePdfContent(text, document.documentType);
      
      // Store analysis results
      const documentAnalysis = await prisma.financialDocumentAnalysis.create({
        data: {
          documentId,
          rawText: text.substring(0, 10000), // Store partial text if needed
          analysisData: JSON.parse(JSON.stringify(analysis)),
          confidence: (analysis as any).sentiment?.score || 0,
          keyPoints: [],
          anomalies: [],
          actionItems: []
        }
      });
      
      // Update document status
      await prisma.financialDocument.update({
        where: { id: documentId },
        data: { 
          processingStatus: PROCESSING_STATUS.COMPLETED,
          processedAt: new Date()
        }
      });
      
      // Clean up any temporary data
      await prisma.tempDocumentData.deleteMany({
        where: { documentId }
      });
      
      return NextResponse.json({
        success: true,
        documentId,
        analysisId: documentAnalysis.id
      });
    } catch (error) {
      console.error('Document analysis error:', error);
      
      // Update document status to error
      await prisma.financialDocument.update({
        where: { id: documentId },
        data: { 
          processingStatus: "failed",
          processingErrors: error instanceof Error ? error.message : "Unknown error"
        }
      });
      
      return NextResponse.json(
        { error: 'Failed to analyze document', details: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}