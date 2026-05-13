import { useMemo, useState } from 'react'

import { AuthSessionContext, type AuthSessionValue } from './context'

const REFRESH_TOKEN_KEY = 'pulseboard.refresh-token'

function getStoredRefreshToken(): string | null {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(() => getStoredRefreshToken())
  const [currentUser, setCurrentUser] = useState<AuthSessionValue['currentUser']>(null)

  const value = useMemo<AuthSessionValue>(
    () => ({
      accessToken,
      refreshToken,
      currentUser,
      setSession(nextAccessToken, nextRefreshToken) {
        setAccessToken(nextAccessToken)
        setRefreshToken(nextRefreshToken)
        window.localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken)
      },
      setCurrentUser,
      clearSession() {
        setAccessToken(null)
        setRefreshToken(null)
        setCurrentUser(null)
        window.localStorage.removeItem(REFRESH_TOKEN_KEY)
      },
    }),
    [accessToken, currentUser, refreshToken],
  )

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}

