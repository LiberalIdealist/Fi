import type { Profile } from "@prisma/client"

export interface AuthError {
  error: string
  description: string
}

export type AuthUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  profile?: Profile | null
}

export interface QuestionnaireAnswers {
  [key: string]: string
}
