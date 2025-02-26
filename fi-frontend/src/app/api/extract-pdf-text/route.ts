import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Create a temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `pdf-${Date.now()}.pdf`);
    
    // Convert file to buffer and write to temp file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(tempFilePath, buffer);
    
    // Use pdftotext (if available) to extract text
    try {
      // Check if pdftotext is available
      await execAsync('which pdftotext');
      
      // Extract text using pdftotext
      const { stdout } = await execAsync(`pdftotext -layout "${tempFilePath}" -`);
      
      // Clean up
      fs.unlinkSync(tempFilePath);
      
      return NextResponse.json({ text: stdout });
    } catch (error) {
      // pdftotext not available, return error
      console.error('Error using pdftotext:', error);
      return NextResponse.json(
        { error: 'PDF text extraction failed. pdftotext not available on server.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from PDF' },
      { status: 500 }
    );
  }
}