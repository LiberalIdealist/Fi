import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function diagnoseFirebase() {
  try {
    // Log environment variables (sanitized)
    console.log("Environment variables check:");
    console.log(`- FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID || 'MISSING'}`);
    console.log(`- FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? 'PRESENT' : 'MISSING'}`);
    console.log(`- FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? 'PRESENT' : 'MISSING'}`);
    console.log(`- FIREBASE_PRIVATE_KEY_BASE64: ${process.env.FIREBASE_PRIVATE_KEY_BASE64 ? 'PRESENT' : 'MISSING'}`);
    
    // Load service account
    let serviceAccount;
    
    if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
      const decodedJson = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
      try {
        serviceAccount = JSON.parse(decodedJson);
        console.log("\nService account loaded from base64:");
        console.log(`- Project ID: ${serviceAccount.project_id}`);
        console.log(`- Client Email: ${serviceAccount.client_email}`);
        
        // Save decoded service account for inspection
        fs.writeFileSync('decoded-service-account.json', decodedJson);
        console.log("- Decoded service account saved to decoded-service-account.json");
      } catch (parseError) {
        console.error("Failed to parse base64 service account:", parseError);
      }
    } else if (process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID || '',
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
        client_id: process.env.FIREBASE_CLIENT_ID
      };
      console.log("\nService account constructed from env vars:");
      console.log(`- Project ID: ${serviceAccount.project_id}`);
      console.log(`- Client Email: ${serviceAccount.client_email}`);
    } else {
      console.error("No service account credentials found!");
      return;
    }
    
    // Initialize Firebase Admin
    console.log("\nInitializing Firebase Admin...");
    if (admin.apps.length > 0) {
      console.log("Firebase already initialized, deleting app...");
      await admin.app().delete();
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log("Firebase Admin initialized successfully.");
    
    // Test Auth
    console.log("\nTesting Firebase Authentication...");
    try {
      await admin.auth().listUsers(1);
      console.log("✅ Authentication working!");
    } catch (authError) {
      console.error("❌ Authentication error:", authError);
    }
    
    // Test Firestore
    console.log("\nTesting Firestore...");
    try {
      // First test - list collections
      console.log("- Trying to list collections...");
      const db = admin.firestore();
      const collections = await db.listCollections();
      console.log(`✅ Found ${collections.length} collections`);
      
      // Second test - write/read a document
      console.log("- Trying to write a test document...");
      await db.collection('test').doc('diagnostic').set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        test: "Firestore diagnostic test"
      });
      
      console.log("- Trying to read the test document...");
      const docRef = await db.collection('test').doc('diagnostic').get();
      
      if (docRef.exists) {
        console.log("✅ Successfully read document:", docRef.data());
      } else {
        console.log("❌ Document not found!");
      }
      
      console.log("Firestore tests completed.");
    } catch (firestoreError) {
      console.error("❌ Firestore error:", firestoreError);
      if (firestoreError && typeof firestoreError === 'object' && 'code' in firestoreError) {
        console.error("Error code:", firestoreError.code);
        if ('details' in firestoreError) {
          console.error("Error details:", firestoreError.details);
        }
      }
    }
    
  } catch (error) {
    console.error("Diagnostic error:", error);
  }
}

diagnoseFirebase().then(() => console.log("Diagnosis complete."));