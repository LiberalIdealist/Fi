import { NextRequest, NextResponse } from "next/server.js";
import { deleteFile } from "@/config/cloudStorage.js"; // Use named import instead of default
import { Storage } from '@google-cloud/storage';

export async function DELETE(req: NextRequest) {
  try {
    const { fileUrl } = await req.json();
    
    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 });
    }

    // Extract file name from URL
    const bucketName = process.env.GCS_BUCKET_NAME as string;
    const fileName = fileUrl.split(`/${bucketName}/`)[1];
    // Delete the file from Google Cloud Storage
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    await file.delete();

    return NextResponse.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}