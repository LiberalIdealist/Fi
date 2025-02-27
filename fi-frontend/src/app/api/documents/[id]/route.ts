import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth.config";
import { BlobServiceClient } from "@azure/storage-blob";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documentId = params.id;

    // Get the document to check ownership and get file URL
    const document = await prisma.financialDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.userEmail !== session.user.email) {
      return NextResponse.json({ error: "Not authorized to delete this document" }, { status: 403 });
    }

    // Delete from database
    await prisma.financialDocument.delete({
      where: { id: documentId },
    });

    // Delete from Azure Blob Storage
    try {
      const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
      if (AZURE_STORAGE_CONNECTION_STRING) {
        // Extract blob name from URL
        const url = new URL(document.fileUrl);
        const blobPath = url.pathname.substring(1); // Remove leading slash
        const containerName = blobPath.split('/')[0];
        const blobName = blobPath.substring(containerName.length + 1);

        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        await blockBlobClient.delete();
      }
    } catch (blobError) {
      console.error("Error deleting blob:", blobError);
      // Continue even if blob deletion fails
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Document deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete document", details: (error as Error).message },
      { status: 500 }
    );
  }
}