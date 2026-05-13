import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '../../lib/api/client'

const actions = [
  { label: 'Pin post', value: 'pin' },
  { label: 'Unpin post', value: 'unpin' },
  { label: 'Lock post', value: 'lock' },
  { label: 'Unlock post', value: 'unlock' },
  { label: 'Delete post', value: 'delete' },
] as const

async function moderatePost(accessToken: string, postId: string, action: string) {
  const { data, error } = await apiClient.POST('/api/v1/posts/{post_id}/moderate', {
    body: { action },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      path: { post_id: postId },
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to apply moderation action.')
  }

  return data
}

export function ModerationActions({
  accessToken,
  postId,
}: {
  accessToken: string | null
  postId: string
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (action: string) => {
      if (accessToken === null) {
        throw new Error('Sign in to moderate posts.')
      }

      return moderatePost(accessToken, postId, action)
    },
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['post', postId] })
      void queryClient.invalidateQueries({ queryKey: ['post', postId, 'comments'] })
    },
  })

  return (
    <section className="panel form-panel full-width-panel">
      <h2 className="section-title">Moderation</h2>
      <div className="inline-links top-offset-sm">
        {actions.map((action) => (
          <button
            className="secondary-button auth-submit"
            disabled={mutation.isPending}
            key={action.value}
            onClick={() => mutation.mutate(action.value)}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
      {mutation.isError ? <p className="error-text top-offset-sm">Unable to apply moderation.</p> : null}
      {mutation.isSuccess ? <p className="success-text top-offset-sm">Moderation applied.</p> : null}
    </section>
  )
}
