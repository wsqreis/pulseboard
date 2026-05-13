import { createContext } from 'react'

import type { UserResponse } from './api'

export interface AuthSessionValue {
  accessToken: string | null
  refreshToken: string | null
  currentUser: UserResponse | null
  setSession: (accessToken: string, refreshToken: string) => void
  setCurrentUser: (user: UserResponse | null) => void
  clearSession: () => void
}

export const AuthSessionContext = createContext<AuthSessionValue | null>(null)
