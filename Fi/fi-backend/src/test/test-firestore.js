import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Get current file path (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root
const projectRoot = resolve(__dirname, '../../');
dotenv.config({ path: resolve(projectRoot, '.env') });

console.log("Environment check:");
console.log(`- .env path: ${resolve(projectRoot, '.env')}`);
console.log(`- .env exists: ${fs.existsSync(resolve(projectRoot, '.env'))}`);
console.log(`- FIREBASE_PRIVATE_KEY_BASE64: ${process.env.FIREBASE_PRIVATE_KEY_BASE64 ? "Found (length: " + process.env.FIREBASE_PRIVATE_KEY_BASE64.length + ")" : "Not found"}`);

async function testFirestore() {
  let serviceAccount;

  try {
    // MATCHING EXACTLY THE LOGIC FROM firebase.ts
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
    
    // Validate required fields
    const requiredFields = ['project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required Firebase credential fields: ${missingFields.join(', ')}`);
    }
    
    // Print diagnostic info
    console.log(`Project ID: ${serviceAccount.project_id}`);
    console.log(`Client email: ${serviceAccount.client_email.substring(0, 20)}...`);
    console.log(`Private key starting with: ${serviceAccount.private_key.substring(0, 20)}...`);
    
    // Check if Firebase app is already initialized
    if (admin.apps.length) {
      console.log("Firebase already initialized, deleting existing app...");
      await admin.app().delete();
    }
    
    // Initialize Firebase with minimal configuration first
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    console.log("Firebase Admin initialized successfully");
    console.log(`Connected to Firebase project: ${serviceAccount.project_id}`);
    
    // Test Auth first
    console.log("\nTesting Firebase Auth...");
    try {
      const users = await admin.auth().listUsers(1);
      console.log(`✓ Auth working! Found ${users.users.length} users.`);
    } catch (authError) {
      console.error("✗ Auth error:", authError);
    }
    
    // Now test Firestore with explicit database
    console.log("\nTesting Firestore...");
    try {
      // Get base Firestore instance
      const baseDb = admin.firestore();
      
      // Configure specific database and region using alternative method
      baseDb.settings({
        host: 'asia-south1-firestore.googleapis.com', // Region specific host
        ssl: true,
        databaseId: 'users' // Database ID setting
      });
      
      // Get a reference to the specific database
      const db = baseDb;
      
      console.log("Firestore configured with:");
      console.log("- Database ID: users");
      console.log("- Region: asia-south1");
      
      console.log("- Listing collections...");
      const collections = await db.listCollections();
      console.log(`✓ Successfully listed collections (found ${collections.length})`);
      
      if (collections.length > 0) {
        console.log("Collections:");
        collections.forEach(col => console.log(`  - ${col.id}`));
      }
      
      // Write test doc
      console.log("- Writing test document...");
      await db.collection('test').doc('firestore-test').set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        message: "Test from diagnostic script",
        testDate: new Date().toISOString()
      });
      console.log("✓ Successfully wrote test document");
      
      // Read test doc
      console.log("- Reading test document...");
      const doc = await db.collection('test').doc('firestore-test').get();
      console.log("✓ Successfully read document");
      console.log("  Document data:", doc.data());
      
      console.log("\n✅ FIRESTORE IS WORKING CORRECTLY!");
    } catch (firestoreError) {
      console.error("✗ Firestore error:", firestoreError);
      
      if (firestoreError.code === 5) {
        console.error("\n❌ DIAGNOSIS: NOT_FOUND error indicates:");
        console.error("1. The Firestore database doesn't exist");
        console.error("2. The project ID is incorrect");
        console.error("3. The database name doesn't match expectations");
        
        console.error("\nRECOMMENDED ACTION:");
        console.error(`Check if database exists: firebase firestore:databases:list --project=${serviceAccount.project_id}`);
        console.error(`If not, create it: firebase firestore:databases:create --project=${serviceAccount.project_id}`);
      } else if (firestoreError.code === 7) {
        console.error("\n❌ DIAGNOSIS: PERMISSION_DENIED error indicates:");
        console.error("The service account lacks permissions to access Firestore.");
        
        console.error("\nRECOMMENDED ACTION:");
        console.error("Add the 'Cloud Datastore User' role to your service account:");
        console.error(`gcloud projects add-iam-policy-binding ${serviceAccount.project_id} \\`);
        console.error(`  --member=serviceAccount:${serviceAccount.client_email} \\`);
        console.error("  --role=roles/datastore.user");
      }
    }
    
  } catch (error) {
    console.error("General error during test:", error);
  }
}

// Run the test
testFirestore().then(() => console.log("Test completed"));