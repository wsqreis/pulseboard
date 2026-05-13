import type { components } from '@pulseboard/contracts/src/schema'

import { apiClient } from '../../lib/api/client'

export type AuthResponse = components['schemas']['AuthResponse']
export type MessageResponse = components['schemas']['MessageResponse']
export type UserResponse = components['schemas']['UserResponse']

export async function register(input: components['schemas']['RegisterRequest']) {
  const { data, error } = await apiClient.POST('/api/v1/auth/register', {
    body: input,
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to register right now.')
  }

  return data
}

export async function login(input: components['schemas']['LoginRequest']) {
  const { data, error } = await apiClient.POST('/api/v1/auth/login', {
    body: input,
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to log in right now.')
  }

  return data
}

export async function refreshSession(refreshToken: string) {
  const { data, error } = await apiClient.POST('/api/v1/auth/refresh', {
    body: { refresh_token: refreshToken },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to refresh session.')
  }

  return data
}

export async function verifyEmail(token: string) {
  const { data, error } = await apiClient.POST('/api/v1/auth/verify-email', {
    body: { token },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to verify email right now.')
  }

  return data
}

export async function forgotPassword(email: string) {
  const { data, error } = await apiClient.POST('/api/v1/auth/forgot-password', {
    body: { email },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to start password reset right now.')
  }

  return data
}

export async function resetPassword(input: components['schemas']['ResetPasswordRequest']) {
  const { data, error } = await apiClient.POST('/api/v1/auth/reset-password', {
    body: input,
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to reset password right now.')
  }

  return data
}

export async function fetchCurrentUser(accessToken: string) {
  const { data, error } = await apiClient.GET('/api/v1/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to load the current user.')
  }

  return data
}
