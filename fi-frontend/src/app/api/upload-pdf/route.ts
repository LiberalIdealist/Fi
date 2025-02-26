import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { BlobServiceClient } from "@azure/storage-blob";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth.config";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw new Error("Azure Storage Connection String not configured");
    }

    // Create container if it doesn't exist
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient("financial-docs");
    await containerClient.createIfNotExists();

    // Upload file
    const blobName = `${session.user.email}/${Date.now()}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const arrayBuffer = await file.arrayBuffer();
    
    await blockBlobClient.uploadData(arrayBuffer, {
      blobHTTPHeaders: { blobContentType: file.type }
    });

    // Store in database
    const document = await prisma.financialDocument.create({
      data: {
        userEmail: session.user.email,
        fileName: file.name,
        fileUrl: blockBlobClient.url,
      },
    });

    return NextResponse.json({ 
      success: true, 
      fileUrl: blockBlobClient.url,
      documentId: document.id
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}
