import { useQuery } from '@tanstack/react-query'

import { fetchCurrentUser, refreshSession } from './api'
import { useAuthSession } from './useAuthSession'

export function useAuthBootstrap() {
  const { accessToken, refreshToken, setSession, setCurrentUser, clearSession } = useAuthSession()

  return useQuery({
    queryKey: ['auth', 'bootstrap', refreshToken],
    queryFn: async () => {
      if (accessToken !== null) {
        const user = await fetchCurrentUser(accessToken)
        setCurrentUser(user)
        return user
      }

      if (refreshToken === null) {
        return null
      }

      try {
        const session = await refreshSession(refreshToken)
        setSession(session.tokens.access_token, session.tokens.refresh_token)
        setCurrentUser(session.user)
        return session.user
      } catch {
        clearSession()
        return null
      }
    },
    staleTime: 60_000,
  })
}
