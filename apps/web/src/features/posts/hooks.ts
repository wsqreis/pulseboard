import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createComment,
  createPost,
  fetchBoardPosts,
  fetchComments,
  fetchPost,
  updatePost,
} from './api'

export function useBoardPostsQuery(communitySlug: string, boardSlug: string) {
  return useQuery({
    queryKey: ['board', communitySlug, boardSlug, 'posts'],
    queryFn: async () => fetchBoardPosts(communitySlug, boardSlug),
  })
}

export function usePostQuery(postId: string) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => fetchPost(postId),
  })
}

export function useCommentsQuery(postId: string) {
  return useQuery({
    queryKey: ['post', postId, 'comments'],
    queryFn: async () => fetchComments(postId),
  })
}

export function useCreatePostMutation(
  accessToken: string | null,
  communitySlug: string,
  boardSlug: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { title: string; body_markdown: string }) => {
      if (accessToken === null) {
        throw new Error('Sign in to create a post.')
      }

      return createPost(accessToken, communitySlug, boardSlug, input)
    },
    onSuccess() {
      void queryClient.invalidateQueries({
        queryKey: ['board', communitySlug, boardSlug, 'posts'],
      })
    },
  })
}

export function useUpdatePostMutation(accessToken: string | null, postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { title: string; body_markdown: string }) => {
      if (accessToken === null) {
        throw new Error('Sign in to update posts.')
      }

      return updatePost(accessToken, postId, input)
    },
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })
}

export function useCreateCommentMutation(accessToken: string | null, postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { body_markdown: string; parent_id?: string | null }) => {
      if (accessToken === null) {
        throw new Error('Sign in to comment.')
      }

      return createComment(accessToken, postId, input)
    },
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['post', postId, 'comments'] })
    },
  })
}
