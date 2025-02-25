export interface UserProfileData {
  completedQuestionnaire: boolean;
  riskScore?: number;
  investmentStyle?: string;
}

export interface QuestionnaireAnswers {
  [key: string]: string;
  riskTolerance: string;
  investmentHorizon: string;
  financialGoals: string;
  incomeStability: string;
  investmentKnowledge: string;
}

export interface DashboardProps {
  showQuestionnaire?: boolean;
}