import type { DefaultSession, DefaultUser } from "next-auth"
import type { Profile } from "@prisma/client"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      profile?: Profile | null
    }
    error?: string
  }

  interface User extends DefaultUser {
    id: string
    profile?: Profile | null
  }
}

export interface QuestionnaireAnswers {
  [key: string]: string;
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
  profile: Profile | null;
}

export interface DashboardProps {
  showQuestionnaire?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}