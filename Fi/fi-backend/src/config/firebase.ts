import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize Firebase Admin SDK using application default credentials
// This will automatically use GOOGLE_APPLICATION_CREDENTIALS environment variable
let app;

if (!admin.apps.length) {
  try {
    // Check if we have Google Application Credentials defined as an env var
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // If the credentials are a base64 encoded string, decode and write to a temp file
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS.includes('eyJ')) {
        const tempDir = path.join(process.cwd(), 'temp');
        const credPath = path.join(tempDir, 'service-account.json');
        
        // Create temp directory if it doesn't exist
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Decode base64 and write to file
        const buff = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64');
        fs.writeFileSync(credPath, buff.toString('utf-8'));
        
        // Use the file path as credential
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
        
        console.log('Using decoded Google Application Credentials from environment variable');
      }
      
      // Initialize with application default credentials
      app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.GCP_BUCKET_NAME,
      });
      console.log('Firebase Admin initialized with Google Application Credentials');
    } else {
      // Fallback to project configuration if no credentials file is specified
      const firebaseConfig = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.GCP_BUCKET_NAME,
      };
      
      app = admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
      });
      console.log('Firebase Admin initialized with project configuration');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw new Error('Failed to initialize Firebase Admin SDK');
  }
}

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.GCP_BUCKET_NAME,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const db = admin.firestore();
export const storage = admin.storage().bucket();
export const auth = admin.auth();
export { admin };