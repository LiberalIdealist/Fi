import { NextRequest, NextResponse } from "next/server";
import  Storage  from "@/config/cloudStorage";
import { analyzeDocument } from "@/utils/googleNLP";
import pdfParse from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const { fileUrl } = await req.json();
    
    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 });
    }

    // Download the file from Google Cloud Storage
    const bucket = Storage.bucket(process.env.GCS_BUCKET_NAME as string);
    const fileName = fileUrl.split(`/${process.env.GCS_BUCKET_NAME}/`)[1];
    const file = bucket.file(fileName);

    const [fileBuffer] = await file.download();
    const pdfData = await pdfParse(fileBuffer);
    const extractedText = pdfData.text;

    if (!extractedText) {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 500 });
    }

    // Analyze text using Google NLP
    const analysis = await analyzeDocument(extractedText);

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}