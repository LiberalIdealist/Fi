import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { updateFinancialProfileData } from "@/utils/financialDataAggregator";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await req.json();
    
    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    // Get document from database
    const document = await prisma.financialDocument.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        userEmail: true,
        fileName: true,
        fileUrl: true,
        contentText: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.userEmail !== session.user.email) {
      return NextResponse.json({ error: "Not authorized to access this document" }, { status: 403 });
    }

    // Get the user's financial profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { financialProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if document content is available
    if (!document.contentText) {
      return NextResponse.json({ error: "Document content not available" }, { status: 400 });
    }

    const documentContent = document.contentText;

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // First, determine the document type
    const typePrompt = `
      Analyze this financial document and identify its type.
      Return ONLY one of these categories without explanation:
      - Bank Statement
      - Salary Slip
      - Credit Card Statement
      - Loan Statement
      - Investment Account
      - Tax Document
      - Insurance Document
      - Other Financial Document
      
      Document content:
      ${documentContent.substring(0, 2000)}...
    `;

    const typeResult = await model.generateContent(typePrompt);
    const documentType = typeResult.response.text().trim();
    
    // Now create a detailed analysis prompt based on the document type
    const analysisPrompt = `
      You are a financial data extraction specialist analyzing a ${documentType}.
      Extract detailed financial information from this document.
      
      INSTRUCTIONS:
      1. Extract all relevant financial metrics based on the document type
      2. Format your response as structured JSON only
      3. Use numerical values without currency symbols
      4. Include date ranges when available
      5. Extract recurring patterns when detected
      
      OUTPUT FORMAT:
      {
        "documentType": "${documentType}",
        "period": {
          "startDate": "YYYY-MM-DD", // or null if not found
          "endDate": "YYYY-MM-DD"    // or null if not found
        },
        "metrics": {
          ${getMetricsTemplate(documentType)}
        },
        "insights": [
          // 3-5 key insights about the financial situation based on this document
        ]
      }
      
      FULL DOCUMENT CONTENT:
      ${documentContent}
      
      Return ONLY the JSON output without any additional text, explanation, or markdown formatting.
    `;

    try {
      const analysisResult = await model.generateContent(analysisPrompt);
      const analysisText = analysisResult.response.text();
      
      // Parse the JSON response
      let analysisData;
      try {
        // Extract JSON from the response text (in case there's any wrapping text)
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          analysisData = JSON.parse(analysisText);
        }
      } catch (jsonError) {
        console.error("Error parsing Gemini response:", jsonError);
        return NextResponse.json({ error: "Failed to parse analysis results" }, { status: 500 });
      }

      // Create or get financial profile
      let financialProfileId = user.financialProfile?.id;
      
      if (!financialProfileId) {
        const newProfile = await prisma.financialProfile.create({
          data: { userId: user.id }
        });
        financialProfileId = newProfile.id;
      }
      
      // Save the analysis result to the database
      const analysis = await prisma.documentAnalysis.create({
        data: {
          documentId: document.id,
          analysisContent: analysisText,
          structuredData: analysisData,
          documentType: analysisData.documentType || documentType,
          period: analysisData.period || null,
          insights: analysisData.insights || [],
          userProfileId: financialProfileId,
        },
      });
      
      // Mark document as analyzed
      await prisma.financialDocument.update({
        where: { id: document.id },
        data: { analyzedAt: new Date() },
      });

      // Update aggregated financial data
      await updateFinancialProfileData(financialProfileId);

      return NextResponse.json({
        success: true,
        documentId: document.id,
        documentName: document.fileName,
        documentType: analysisData.documentType || documentType,
        insights: analysisData.insights || [],
        analysisId: analysis.id
      });

    } catch (error) {
      console.error("Error analyzing document with Gemini:", error);
      return NextResponse.json({ error: "Failed to analyze document" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in analyze-document route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper function to generate metrics template based on document type
function getMetricsTemplate(documentType: string): string {
  switch (documentType.toLowerCase()) {
    case 'bank statement':
      return `
        "openingBalance": number,
        "closingBalance": number,
        "totalDeposits": number,
        "totalWithdrawals": number,
        "recurringIncome": [
          {"source": "string", "amount": number, "frequency": "string"}
        ],
        "recurringExpenses": [
          {"description": "string", "amount": number, "frequency": "string"}
        ],
        "topExpenseCategories": [
          {"category": "string", "amount": number}
        ]`;
    
    case 'salary slip':
      return `
        "grossSalary": number,
        "netSalary": number,
        "taxDeductions": number,
        "otherDeductions": number,
        "bonus": number,
        "employer": "string",
        "payPeriod": "string"`;
    
    case 'credit card statement':
      return `
        "totalOutstanding": number,
        "minimumDue": number,
        "creditLimit": number,
        "availableCredit": number,
        "interestRate": number,
        "paymentDueDate": "YYYY-MM-DD",
        "topSpendingCategories": [
          {"category": "string", "amount": number}
        ]`;
    
    case 'loan statement':
      return `
        "loanType": "string",
        "loanAmount": number,
        "principalOutstanding": number,
        "interestRate": number,
        "emiAmount": number,
        "tenureRemaining": number,
        "lender": "string"`;
    
    case 'investment account':
      return `
        "accountType": "string",
        "totalInvestmentValue": number,
        "holdings": [
          {"name": "string", "units": number, "value": number}
        ],
        "assetAllocation": {
          "equity": number,
          "debt": number,
          "others": number
        },
        "returns": {
          "absolute": number,
          "annualized": number
        }`;
    
    default:
      return `
        // Extract any relevant financial metrics found in the document
        "balance": number,
        "income": [{"source": "string", "amount": number}],
        "expenses": [{"category": "string", "amount": number}],
        "debt": number,
        "assets": number`;
  }
}