import { useForm } from 'react-hook-form'

import { useCreateCommentMutation } from '../hooks'

interface CreateCommentFormValues {
  body_markdown: string
}

export function CreateCommentForm({
  accessToken,
  postId,
}: {
  accessToken: string | null
  postId: string
}) {
  const { handleSubmit, register, reset } = useForm<CreateCommentFormValues>()
  const mutation = useCreateCommentMutation(accessToken, postId)

  return (
    <form
      className="auth-form stack-md"
      onSubmit={handleSubmit(async (values) => {
        await mutation.mutateAsync({ body_markdown: values.body_markdown })
        reset()
      })}
    >
      <label className="field-stack">
        <span>Add a comment</span>
        <textarea className="text-input text-area" {...register('body_markdown')} rows={4} />
      </label>
      <button className="primary-button auth-submit" disabled={mutation.isPending} type="submit">
        {mutation.isPending ? 'Posting…' : 'Post comment'}
      </button>
      {mutation.isError ? <p className="error-text">Unable to add the comment.</p> : null}
    </form>
  )
}
