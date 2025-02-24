import { AuthError } from '@/types/auth'

export const handleAuthCallback = (callbackUrl: string): string => {
  try {
    const url = new URL(callbackUrl)
    const path = url.pathname + url.search
    
    // Security: Only allow relative paths
    return path.startsWith('/') && !path.startsWith('//') ? path : '/dashboard'
  } catch {
    return '/dashboard'
  }
}

export const handleAuthError = (error: string): AuthError => {
  const errors: Record<string, string> = {
    AccessDenied: 'You do not have permission to sign in',
    Default: 'Authentication failed. Please try again.'
  }
  
  return {
    error,
    description: errors[error] || errors.Default
  }
}