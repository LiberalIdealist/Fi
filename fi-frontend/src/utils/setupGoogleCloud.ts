import { LanguageServiceClient } from '@google-cloud/language';
import fs from 'fs';
import path from 'path';

/**
 * Initializes Google Cloud clients for server-side use
 */
export function initializeGoogleCloudClients() {
  // Only run on server
  if (typeof window !== 'undefined') return null;
  
  try {
    // Check if we have explicit credentials path
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH;
    
    if (credentialsPath) {
      // Make sure file exists
      const resolvedPath = path.resolve(process.cwd(), credentialsPath);
      if (!fs.existsSync(resolvedPath)) {
        console.error(`Credentials file not found at: ${resolvedPath}`);
        return null;
      }
      
      // Set environment variable for Google libraries
      process.env.GOOGLE_APPLICATION_CREDENTIALS = resolvedPath;
    }
    
    // Initialize client
    const languageClient = new LanguageServiceClient();
    console.log('Google Cloud Natural Language client initialized successfully');
    
    return { languageClient };
  } catch (error) {
    console.error('Failed to initialize Google Cloud clients:', error);
    return null;
  }
}