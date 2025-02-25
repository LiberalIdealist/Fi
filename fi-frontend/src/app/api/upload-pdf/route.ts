import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";  // Ensure prisma client is correctly set up
import { BlobServiceClient } from "@azure/storage-blob";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const email = formData.get("email") as string;

    if (!file || !email) {
      return NextResponse.json({ error: "Missing file or email" }, { status: 400 });
    }

    // Upload PDF to Azure Blob Storage
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient("financial-docs");
    const blobClient = containerClient.getBlockBlobClient(`${email}/${file.name}`);
    
    const arrayBuffer = await file.arrayBuffer();
    await blobClient.uploadData(arrayBuffer);

    // Store file reference in database
    await prisma.financialDocument.create({
      data: {
        userEmail: email,
        fileName: file.name,
        fileUrl: blobClient.url,
      },
    });

    return NextResponse.json({ success: true, fileUrl: blobClient.url });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
