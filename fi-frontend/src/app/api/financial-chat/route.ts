import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { financialProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
      
      if (!conversation || conversation.userId !== user.id) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          messages: {
            create: []
          }
        },
        include: { messages: true }
      });
    }

    // Store the user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        role: "user"
      }
    });

    // Context for the AI based on user profile and past messages
    let context = "You are a financial advisor assistant for an Indian user.";
    
    if (user.financialProfile?.responses) {
      context += " Based on the user's financial profile, they are ";
      const responses = user.financialProfile.responses as Record<string, string>;
      
      if (responses.q3) {
        context += `${responses.q3} comfortable with high-risk investments. `;
      }
      
      if (responses.q2) {
        context += `Their primary financial goal is ${responses.q2}. `;
      }
      
      if (responses.q6) {
        context += `They save ${responses.q6} of their income monthly. `;
      }
    }

    // Get the last 10 messages for context
    const recentMessages = conversation.messages.slice(-10);
    let conversationHistory = "";
    
    for (const msg of recentMessages) {
      conversationHistory += `${msg.role}: ${msg.content}\n`;
    }

    // Use Gemini API for response
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      ${context}
      
      Previous conversation:
      ${conversationHistory}
      
      User: ${message}
      
      Provide a helpful response about Indian financial markets, investments, or personal finance. 
      Format your response as plain text without markdown symbols, headings, or bullet points.
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    
    // Store the AI response
    const savedResponse = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: aiResponse,
        role: "assistant"
      }
    });

    // If financial profile exists, update AI recommendations based on the conversation
    if (user.financialProfile) {
      await prisma.financialProfile.update({
        where: { id: user.financialProfile.id },
        data: {
          aiRecommendations: aiResponse.slice(0, 300) + "...", // Store a summary
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversation.id,
      messageId: savedResponse.id
    });
    
  } catch (error) {
    console.error("Error in financial-chat route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}