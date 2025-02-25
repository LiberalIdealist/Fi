import type { QuestionnaireAnswers, UserProfileData } from './shared';

export interface UserProfileProps {
  data: UserProfileData | null;
}

export interface FinancialQuestionnaireProps {
  onSubmit: (answers: QuestionnaireAnswers) => Promise<void>;
}

export type { QuestionnaireAnswers };  // Re-export for components