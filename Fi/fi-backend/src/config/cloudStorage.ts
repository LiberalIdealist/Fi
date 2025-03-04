import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Storage
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// Extract the bucket name without the 'gs://' prefix
const rawBucketName = process.env.GCP_BUCKET_NAME || "";
const bucketName = rawBucketName.replace(/^gs:\/\//, '');

if (!bucketName) {
  console.error('Error: GCP_BUCKET_NAME is not properly configured in .env');
  throw new Error('Google Cloud Storage bucket name is required');
}

// Initialize bucket with the corrected name
const bucket = storage.bucket(bucketName);

export async function uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  const file = bucket.file(fileName);
  const stream = file.createWriteStream({
    metadata: { contentType: mimeType },
    resumable: false
  });

  return new Promise((resolve, reject) => {
    stream.on("error", (error) => {
      console.error("Upload error:", error);
      reject(error);
    });
    
    stream.on("finish", async () => {
      try {
        // Make the file publicly accessible
        await file.makePublic();
        
        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        resolve(publicUrl);
      } catch (error) {
        console.error("Error making file public:", error);
        reject(error);
      }
    });
    
    // Write the file and end the stream
    stream.end(fileBuffer);
  });
}

export async function deleteFile(fileName: string): Promise<void> {
  try {
    await bucket.file(fileName).delete();
    console.log(`Successfully deleted file: ${fileName}`);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

export { bucket, storage };