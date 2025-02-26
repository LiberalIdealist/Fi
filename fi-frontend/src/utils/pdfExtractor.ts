// Create a simple client-side file handler that doesn't depend on PDF extraction
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Create form data to send the file to the server
    const formData = new FormData();
    formData.append('file', file);
    
    // Send the file to a server endpoint that will extract the text
    const response = await fetch('/api/extract-pdf-text', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`PDF extraction failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}