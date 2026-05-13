import { useQuery } from '@tanstack/react-query'

import { fetchCurrentUser, refreshSession } from './api'
import { useAuthSession } from './useAuthSession'

export function useAuthBootstrap() {
  const { accessToken, refreshToken, setSession, clearSession } = useAuthSession()

  return useQuery({
    queryKey: ['auth', 'bootstrap', refreshToken],
    queryFn: async () => {
      if (accessToken !== null) {
        return fetchCurrentUser(accessToken)
      }

      if (refreshToken === null) {
        return null
      }

      try {
        const session = await refreshSession(refreshToken)
        setSession(session.tokens.access_token, session.tokens.refresh_token)
        return session.user
      } catch {
        clearSession()
        return null
      }
    },
    staleTime: 60_000,
  })
}
