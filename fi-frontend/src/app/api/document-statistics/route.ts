import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with financial data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        financialProfile: {
          include: {
            financialData: true,
            documentAnalyses: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        },
        documents: {
          orderBy: { analyzedAt: 'desc' },
          select: {
            id: true,
            fileName: true,
            analyzedAt: true,
            fileUrl: true,
            uploadedAt: true
          },
          take: 10
        }
      },
    });

    if (!user || !user.financialProfile) {
      return NextResponse.json({ error: "Financial profile not found" }, { status: 404 });
    }

    const financialData = user.financialProfile.financialData;
    
    // If no financial data exists yet
    if (!financialData) {
      return NextResponse.json({
        stats: {
          dataCompleteness: 0,
          documentCount: user.documents.length,
          analyzedDocumentCount: user.documents.filter(doc => doc.analyzedAt).length,
          lastAnalyzedAt: user.documents.find(doc => doc.analyzedAt)?.analyzedAt || null
        },
        documents: user.documents,
        financialHealthScore: calculateFinancialHealthScore(null)
      });
    }

    // Format statistics from financial data
    const statistics = {
      income: {
        monthly: financialData.monthlyIncome,
        streams: financialData.incomeStreams || [],
        stability: financialData.incomeStability
      },
      spending: {
        monthly: financialData.monthlySpending,
        categories: financialData.spendingimport { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with financial data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        financialProfile: {
          include: {
            financialData: true,
            documentAnalyses: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        },
        documents: {
          orderBy: { analyzedAt: 'desc' },
          select: {
            id: true,
            fileName: true,
            analyzedAt: true,
            fileUrl: true,
            uploadedAt: true
          },
          take: 10
        }
      },
    });

    if (!user || !user.financialProfile) {
      return NextResponse.json({ error: "Financial profile not found" }, { status: 404 });
    }

    const financialData = user.financialProfile.financialData;
    
    // If no financial data exists yet
    if (!financialData) {
      return NextResponse.json({
        stats: {
          dataCompleteness: 0,
          documentCount: user.documents.length,
          analyzedDocumentCount: user.documents.filter(doc => doc.analyzedAt).length,
          lastAnalyzedAt: user.documents.find(doc => doc.analyzedAt)?.analyzedAt || null
        },
        documents: user.documents,
        financialHealthScore: calculateFinancialHealthScore(null)
      });
    }

    // Format statistics from financial data
    const statistics = {
      income: {
        monthly: financialData.monthlyIncome,
        streams: financialData.incomeStreams || [],
        stability: financialData.incomeStability
      },
      spending: {
        monthly: financialData.monthlySpending,
        categories: financialData.spending