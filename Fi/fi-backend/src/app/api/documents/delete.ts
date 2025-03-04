import { NextRequest, NextResponse } from "next/server";
import Storage  from "@/config/cloudStorage";

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
    const bucket = Storage.bucket(bucketName);
    const file = bucket.file(fileName);
    await file.delete();

    return NextResponse.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}