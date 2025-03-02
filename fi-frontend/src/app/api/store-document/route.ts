import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BlobServiceClient } from "@azure/storage-blob";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth.config";
import { PROCESSING_STATUS } from "@/constants/appConstants";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string || "other";
    const password = formData.get("password") as string || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Azure storage setup
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw new Error("Azure Storage Connection String not configured");
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient("financial-docs");
    await containerClient.createIfNotExists();

    // Upload file with unique name
    const blobName = `${session.user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const arrayBuffer = await file.arrayBuffer();
    
    await blockBlobClient.uploadData(arrayBuffer, {
      blobHTTPHeaders: { blobContentType: file.type }
    });

    // Store document metadata in database
    const document = await prisma.financialDocument.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        documentType,
        fileUrl: blockBlobClient.url,
        isPasswordProtected: !!password,
        processingStatus: "pending",
      },
    });

    // Update processing status
    await prisma.financialDocument.update({
      where: { id: document.id },
      data: { processingStatus: PROCESSING_STATUS.PROCESSING }
    });

    // If password was provided, store it securely for analysis
    if (password) {
      // Store password temporarily and securely for document processing
      // In a production app, use a secure vault or encrypt the password
      const tempStorage = await prisma.tempDocumentData.create({
        data: {
          documentId: document.id,
          dataKey: "password",
          dataValue: password,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        }
      });
    }

    // Later when processing completes
    await prisma.financialDocument.update({
      where: { id: document.id },
      data: { 
        processingStatus: PROCESSING_STATUS.COMPLETED,
        processedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      documentId: document.id,
      documentType
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}