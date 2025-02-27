import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth.config';
import { extractTextFromPDF } from '@/utils/pdfExtractor';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const document = await prisma.financialDocument.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        userEmail: true,
        fileName: true,
        fileUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.userEmail !== session.user.email) {
      return NextResponse.json({ error: 'Not authorized to access this document' }, { status: 403 });
    }

    const text = await extractTextFromPDF(document.fileUrl);

    await prisma.financialDocument.update({
      where: { id: document.id },
      data: { contentText: text },
    });

    return NextResponse.json({ success: true, contentText: text });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error extracting text from PDF:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}