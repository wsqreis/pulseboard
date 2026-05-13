import type { components } from '@pulseboard/contracts'

import { apiClient } from '../../lib/api/client'

export type CommentResponse = components['schemas']['CommentResponse']
export type PostResponse = components['schemas']['PostResponse']

function authorizationHeader(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export async function fetchBoardPosts(communitySlug: string, boardSlug: string) {
  const { data, error } = await apiClient.GET('/api/v1/boards/{community_slug}/{board_slug}/posts', {
    params: {
      path: {
        board_slug: boardSlug,
        community_slug: communitySlug,
      },
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to load posts for this board.')
  }

  return data
}

export async function createPost(
  accessToken: string,
  communitySlug: string,
  boardSlug: string,
  input: components['schemas']['CreatePostRequest'],
) {
  const { data, error } = await apiClient.POST('/api/v1/boards/{community_slug}/{board_slug}/posts', {
    body: input,
    headers: authorizationHeader(accessToken),
    params: {
      path: {
        board_slug: boardSlug,
        community_slug: communitySlug,
      },
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to create the post.')
  }

  return data
}

export async function fetchPost(postId: string) {
  const { data, error } = await apiClient.GET('/api/v1/posts/{post_id}', {
    params: {
      path: { post_id: postId },
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to load the post.')
  }

  return data
}

export async function updatePost(
  accessToken: string,
  postId: string,
  input: components['schemas']['UpdatePostRequest'],
) {
  const { data, error } = await apiClient.PATCH('/api/v1/posts/{post_id}', {
    body: input,
    headers: authorizationHeader(accessToken),
    params: {
      path: { post_id: postId },
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to update the post.')
  }

  return data
}

export async function fetchComments(postId: string) {
  const { data, error } = await apiClient.GET('/api/v1/posts/{post_id}/comments', {
    params: {
      path: { post_id: postId },
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to load comments.')
  }

  return data
}

export async function createComment(
  accessToken: string,
  postId: string,
  input: components['schemas']['CreateCommentRequest'],
) {
  const { data, error } = await apiClient.POST('/api/v1/posts/{post_id}/comments', {
    body: input,
    headers: authorizationHeader(accessToken),
    params: {
      path: { post_id: postId },
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to add the comment.')
  }

  return data
}
