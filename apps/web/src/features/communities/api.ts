import type { components } from '@pulseboard/contracts'

import { apiClient } from '../../lib/api/client'

export type BoardResponse = components['schemas']['BoardResponse']
export type CommunityResponse = components['schemas']['CommunityResponse']
export type MembershipResponse = components['schemas']['MembershipResponse']

function authorizationHeader(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export async function fetchCommunities() {
  const { data, error } = await apiClient.GET('/api/v1/communities')

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to load communities.')
  }

  return data
}

export async function fetchCommunity(slug: string) {
  const { data, error } = await apiClient.GET('/api/v1/communities/{slug}', {
    params: {
      path: { slug },
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to load community details.')
  }

  return data
}

export async function fetchBoards(slug: string) {
  const { data, error } = await apiClient.GET('/api/v1/communities/{slug}/boards', {
    params: {
      path: { slug },
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to load boards.')
  }

  return data
}

export async function createCommunity(
  accessToken: string,
  input: components['schemas']['CreateCommunityRequest'],
) {
  const { data, error } = await apiClient.POST('/api/v1/communities', {
    body: input,
    headers: authorizationHeader(accessToken),
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to create the community.')
  }

  return data
}

export async function createBoard(
  accessToken: string,
  slug: string,
  input: components['schemas']['CreateBoardRequest'],
) {
  const { data, error } = await apiClient.POST('/api/v1/communities/{slug}/boards', {
    body: input,
    headers: authorizationHeader(accessToken),
    params: {
      path: { slug },
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to create the board.')
  }

  return data
}

export async function joinCommunity(accessToken: string, slug: string) {
  const { data, error } = await apiClient.POST('/api/v1/communities/{slug}/join', {
    headers: authorizationHeader(accessToken),
    params: {
      path: { slug },
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to join the community.')
  }

  return data
}

export async function leaveCommunity(accessToken: string, slug: string) {
  const { data, error } = await apiClient.POST('/api/v1/communities/{slug}/leave', {
    headers: authorizationHeader(accessToken),
    params: {
      path: { slug },
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to leave the community.')
  }

  return data
}
