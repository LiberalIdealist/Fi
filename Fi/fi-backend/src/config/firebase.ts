import * as admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Handle Google Cloud Credentials
if (!admin.apps.length) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Decode base64 credentials if applicable
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS.includes("eyJ")) {
      const tempDir = path.join(process.cwd(), "temp");
      const credPath = path.join(tempDir, "service-account.json");

      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      fs.writeFileSync(credPath, Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, "base64").toString("utf-8"));
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
    }

    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.GCP_BUCKET_NAME,
    });
  } else {
    throw new Error("❌ Firebase credentials missing!");
  }
}

export const db = admin.firestore();
export const storage = admin.storage().bucket();
export const auth = admin.auth();
export { admin };