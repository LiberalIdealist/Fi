import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

try {
  if (!admin.apps.length) {
    // Get Base64 credentials from environment
    const base64Creds = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    
    if (!base64Creds) {
      throw new Error('Firebase credentials not found in environment variables');
    }
    
    // Decode Base64 to JSON
    const credentialsJson = Buffer.from(base64Creds, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(credentialsJson);
    
    // Log project ID for debugging
    console.log('Initializing Firebase Admin with project:', serviceAccount.project_id);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Make sure this matches the project ID in your service account
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    
    console.log('Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

// Export Firebase services
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export default admin;