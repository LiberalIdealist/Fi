import { BlobServiceClient } from '@azure/storage-blob';
import * as pdfjs from 'pdfjs-dist';

// Better approach to handle PDF.js worker
// Instead of importing directly which causes TS errors
let pdfjsWorker: any;
(async () => {
  // Dynamically import the worker
  pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
})();

/**
 * Extracts text from a PDF file stored at a URL
 * @param fileUrl The URL or Azure Blob Storage URL of the PDF file
 * @returns A promise that resolves to the extracted text
 */
export async function extractTextFromPDF(fileUrl: string): Promise<string> {
  try {
    // Check if it's an Azure Blob Storage URL
    if (fileUrl.includes('blob.core.windows.net')) {
      // For Azure Storage URLs, we need to download the file first
      const blobContent = await downloadFromAzure(fileUrl);
      return extractTextFromArrayBuffer(blobContent);
    } else {
      // For regular URLs, we can fetch them directly
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return extractTextFromArrayBuffer(arrayBuffer);
    }
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Downloads a file from Azure Blob Storage
 * @param blobUrl The URL of the blob in Azure Storage
 * @returns A promise that resolves to the file content as ArrayBuffer
 */
async function downloadFromAzure(blobUrl: string): Promise<ArrayBuffer> {
  try {
    // Extract container name and blob name from URL
    // Example URL: https://accountname.blob.core.windows.net/containername/blobname
    const url = new URL(blobUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const containerName = pathParts[0];
    const blobName = pathParts.slice(1).join('/');
    
    // Create BlobServiceClient
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('Azure Storage connection string is not defined');
    }
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    
    // Download blob content
    const downloadResponse = await blobClient.download();
    const blobContent = await streamToBuffer(downloadResponse.readableStreamBody!);
    return new Uint8Array(blobContent).buffer;
  } catch (error) {
    console.error('Error downloading from Azure:', error);
    throw new Error('Failed to download file from Azure storage');
  }
}

/**
 * Converts a readable stream to a buffer
 * @param readableStream The readable stream to convert
 * @returns A promise that resolves to the buffer
 */
async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on('data', (data) => {
      chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}

/**
 * Extracts text from a PDF ArrayBuffer
 * @param arrayBuffer The PDF content as ArrayBuffer
 * @returns A promise that resolves to the extracted text
 */
async function extractTextFromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => 'str' in item ? item.str : '').join(' ');
      text += pageText + '\n\n';
    }
    
    return text.trim();
  } catch (error) {
    console.error('Error extracting text from PDF content:', error);
    throw new Error('Failed to extract text from PDF content');
  }
}