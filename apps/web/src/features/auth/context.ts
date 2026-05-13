import { createContext } from 'react'

export interface AuthSessionValue {
  accessToken: string | null
  refreshToken: string | null
  setSession: (accessToken: string, refreshToken: string) => void
  clearSession: () => void
}

export const AuthSessionContext = createContext<AuthSessionValue | null>(null)
