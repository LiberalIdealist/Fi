export interface QuestionnaireAnswers {
  [key: string]: string;
}

export interface UserProfileData {
  completedQuestionnaire: boolean;
  riskScore?: number;
  investmentStyle?: string;
  lastUpdated?: string;
}

export interface DashboardProps {
  showQuestionnaire?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}