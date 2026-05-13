import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createBoard,
  createCommunity,
  fetchBoards,
  fetchCommunities,
  fetchCommunity,
  joinCommunity,
  leaveCommunity,
} from './api'

export function useCommunitiesQuery() {
  return useQuery({
    queryKey: ['communities'],
    queryFn: fetchCommunities,
  })
}

export function useCommunityQuery(slug: string) {
  return useQuery({
    queryKey: ['community', slug],
    queryFn: async () => fetchCommunity(slug),
  })
}

export function useBoardsQuery(slug: string) {
  return useQuery({
    queryKey: ['community', slug, 'boards'],
    queryFn: async () => fetchBoards(slug),
  })
}

export function useCreateCommunityMutation(accessToken: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { name: string; description: string; visibility: 'public' | 'private' }) => {
      if (accessToken === null) {
        throw new Error('Sign in to create a community.')
      }

      return createCommunity(accessToken, input)
    },
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['communities'] })
    },
  })
}

export function useCreateBoardMutation(accessToken: string | null, slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { name: string; description: string; sort_order: number }) => {
      if (accessToken === null) {
        throw new Error('Sign in to create a board.')
      }

      return createBoard(accessToken, slug, input)
    },
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['community', slug, 'boards'] })
    },
  })
}

export function useJoinCommunityMutation(accessToken: string | null, slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (accessToken === null) {
        throw new Error('Sign in to join communities.')
      }

      return joinCommunity(accessToken, slug)
    },
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['community', slug] })
    },
  })
}

export function useLeaveCommunityMutation(accessToken: string | null, slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (accessToken === null) {
        throw new Error('Sign in to leave communities.')
      }

      return leaveCommunity(accessToken, slug)
    },
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['community', slug] })
    },
  })
}
