import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from "fs";
import path from "path";

dotenv.config();

try {
  // Check if we have any existing Firebase apps initialized
  if (!admin.apps.length) {
    console.log("Initializing Firebase Admin SDK...");
    
    // Use application default credentials (from GOOGLE_APPLICATION_CREDENTIALS)
    admin.initializeApp({
      // No explicit credentials needed - will use GOOGLE_APPLICATION_CREDENTIALS
    });
    
    console.log("Firebase Admin SDK initialized successfully");
  } else {
    console.log("Firebase Admin SDK already initialized");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { admin, db, auth, storage };