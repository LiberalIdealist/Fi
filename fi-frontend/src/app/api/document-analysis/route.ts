import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/auth.config';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check content type to handle different types of requests
    const contentType = request.headers.get('content-type');
    
    let documentContent, documentType, userId;
    
    // Handle different content types
    if (contentType?.includes('multipart/form-data')) {
      // Handle form data (file upload)
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      
      // Get text content from file
      documentContent = await file.text();
      documentType = formData.get('documentType') as string || 'unknown';
      userId = formData.get('userId') as string || session.user.id;
    } 
    else if (contentType?.includes('application/json')) {
      // Handle JSON body with proper error handling
      try {
        const body = await request.text(); // Get raw text first
        console.log('Raw request body:', body.substring(0, 100) + '...'); // Log beginning of body
        
        // Parse JSON manually to provide better error message
        try {
          const parsed = JSON.parse(body);
          documentContent = parsed.documentContent;
          documentType = parsed.documentType;
          userId = parsed.userId || session.user.id;
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          return NextResponse.json({ 
            error: 'Invalid JSON in request body',
            details: parseError instanceof Error ? parseError.message : 'Unknown parsing error' 
          }, { status: 400 });
        }
      } catch (error) {
        console.error('Error reading request body:', error);
        return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
      }
    }
    else {
      return NextResponse.json({ 
        error: 'Unsupported content type. Use application/json or multipart/form-data' 
      }, { status: 400 });
    }
    
    // Validate required data
    if (!documentContent) {
      return NextResponse.json({ error: 'No document content provided' }, { status: 400 });
    }
    
    // Process with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Generate prompt for analysis
    const analysisPrompt = `
      Analyze the following financial document as a financial analyst and accountant:
      
      Document Type: ${documentType}
      
      Content:
      ${documentContent.substring(0, 10000)} // Limit to avoid token limitations
      
      Please extract and analyze the following information:
      1. Account balances and summary
      2. Transaction patterns
      3. Key financial metrics
      4. Insights and recommendations
      
      Format your response as JSON with clear sections.
    `;
    
    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const analysisText = response.text();
    
    // Extract JSON from response
    try {
      // Find JSON content (might be embedded in text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : null;
      
      if (!jsonContent) {
        throw new Error("No valid JSON found in analysis response");
      }
      
      const analysis = JSON.parse(jsonContent);
      
      // Save analysis to database if needed
      // ...
      
      return NextResponse.json({ success: true, analysis });
    } catch (error) {
      console.error('Error parsing analysis:', error);
      return NextResponse.json({ 
        error: 'Failed to parse analysis response',
        rawResponse: analysisText.substring(0, 500) // Include part of response for debugging
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Document analysis error:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}