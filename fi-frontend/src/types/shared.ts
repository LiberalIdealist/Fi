import type { DefaultSession, DefaultUser } from "next-auth"
import type { Profile } from "@prisma/client"

// NextAuth Type Augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      profile?: Profile | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    error?: string;
  }

  interface User {
    id: string;
    profile?: Profile | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

// JWT Type Augmentation
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    profile: Profile | null;
    error?: string;
  }
}

export type QuestionnaireAnswers = Record<string, string>;

export interface Insight {
  category: string;
  text: string;
}

export interface FinancialAnalysis {
  id: string;
  userId: string;
  riskScore: number;
  summary: string;
  insights: Insight[];
  psychologicalProfile: string;
  recommendedActions: string[];
  timestamp: string;
}

export interface ExtendedFinancialAnalysis extends FinancialAnalysis {
  suggestedFollowUps?: string[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
}

export interface FinancialProfile {
  id: string;
  userId: string;
  responses: QuestionnaireAnswers;
  riskScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  completedQuestionnaire: boolean;
  riskScore: number | null;
  profile?: Profile | null;
  investmentStyle?: string | null; // Add this line
}

export interface DashboardProps {
  showQuestionnaire?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface AnalysisResult {
  id: string;
  userId: string;
  riskScore: number;
  summary: string;
  insights: { category: string; text: string }[];
  psychologicalProfile: string;
  recommendedActions: string[];
  timestamp: string;
}