import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

let firebaseApp;

try {
  // **Handle Base64 Credentials for Firebase**
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS.includes("eyJ")) {
      const tempDir = path.join(process.cwd(), "temp");
      const credPath = path.join(tempDir, "service-account.json");

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const buff = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, "base64");
      fs.writeFileSync(credPath, buff.toString("utf-8"));

      process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
      console.log("✅ Using decoded Google Application Credentials.");
    }
  }

  // **Check if Firebase is already initialized - ESM compatible approach**
  try {
    // Try to get default app - this will throw if not initialized
    firebaseApp = admin.app();
    console.log("✅ Firebase already initialized.");
  } catch (appError) {
    // Initialize if not already done
    firebaseApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Was GCP_BUCKET_NAME
    });
    console.log("✅ Firebase Admin SDK initialized.");
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  throw new Error(`Failed to initialize Firebase Admin SDK: ${error instanceof Error ? error.message : String(error)}`);
}

// **Firebase Config for Client-Side**
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Was GCP_BUCKET_NAME
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// **Export Firebase Services**
export const db = admin.firestore();
export const auth = admin.auth();

// Fix storage export to handle possible empty bucket name
export const storage = process.env.FIREBASE_STORAGE_BUCKET 
  ? admin.storage().bucket() 
  : undefined;  // Or provide a safer fallback

export { admin };
export default firebaseApp;