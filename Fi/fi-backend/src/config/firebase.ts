import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Add proper type definition for service account
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key: string;
  client_email: string;
  client_id?: string;
}

let serviceAccount: ServiceAccount;

try {
  console.log("Loading Firebase credentials...");
  
  // Use individual environment variables for Firebase credentials
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    console.log("Using base64 decoded service account JSON");
    
    // Decode the entire service account JSON
    const decodedJson = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
    
    // Parse the JSON
    try {
      const parsedServiceAccount = JSON.parse(decodedJson);
      
      // Use the complete parsed service account
      serviceAccount = {
        type: parsedServiceAccount.type,
        project_id: parsedServiceAccount.project_id,
        private_key: parsedServiceAccount.private_key,
        client_email: parsedServiceAccount.client_email,
        client_id: parsedServiceAccount.client_id
      };
      
      console.log("Successfully parsed service account from base64");
    } catch (parseError) {
      console.error("Error parsing service account JSON:", parseError);
      throw new Error("Invalid service account JSON in FIREBASE_PRIVATE_KEY_BASE64");
    }
  } else if (process.env.FIREBASE_PRIVATE_KEY) {
    // Fall back to regular private key with newline replacement
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    console.log("Using regular private key with newline replacement");
    
    // Create service account object from separate environment variables
    serviceAccount = {
      "type": "service_account",
      "project_id": process.env.FIREBASE_PROJECT_ID || '',
      "private_key": privateKey,
      "client_email": process.env.FIREBASE_CLIENT_EMAIL || '',
      "client_id": process.env.FIREBASE_CLIENT_ID
    };
  } else {
    throw new Error("No Firebase private key provided in environment variables");
  }
} catch (error) {
  console.error("Error loading Firebase credentials:", error);
  throw new Error(`Failed to load Firebase credentials: ${error instanceof Error ? error.message : String(error)}`);
}

// Check if Firebase app is already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Firebase admin initialization error", error);
    throw new Error(`Failed to initialize Firebase Admin: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Get Firestore with specific configuration
const baseDb = admin.firestore();
baseDb.settings({
  host: 'asia-south1-firestore.googleapis.com', // Region specific host
  ssl: true,
  databaseId: 'wealthme-fi' // Database ID setting
});

// Export the configured Firebase services
export const db = baseDb;
export const auth = admin.auth();
export const storage = admin.storage();
export default admin;