import { NextRequest, NextResponse } from "next/server.js";
import { storage, uploadFile } from "@/config/cloudStorage.js";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json({ error: "File and userId are required" }, { status: 400 });
    }

    // Define storage path
    const bucket = storage.bucket(process.env.GCS_BUCKET_NAME as string);
    const fileName = `uploads/${userId}/${Date.now()}-${file.name}`;
    const fileUpload = bucket.file(fileName);

    // Upload file
    await fileUpload.save(Buffer.from(await file.arrayBuffer()), { contentType: file.type });

    const fileUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileName}`;

    return NextResponse.json({ success: true, fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export default uploadFile;