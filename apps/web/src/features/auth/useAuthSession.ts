import { useContext } from 'react'

import { AuthSessionContext } from './context'

export function useAuthSession() {
  const value = useContext(AuthSessionContext)

  if (value === null) {
    throw new Error('useAuthSession must be used within AuthSessionProvider')
  }

  return value
}
