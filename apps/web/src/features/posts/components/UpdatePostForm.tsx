import { useForm } from 'react-hook-form'

import { useUpdatePostMutation } from '../hooks'

interface UpdatePostFormValues {
  title: string
  body_markdown: string
}

export function UpdatePostForm({
  accessToken,
  postId,
  initialBody,
  initialTitle,
}: {
  accessToken: string | null
  postId: string
  initialBody: string
  initialTitle: string
}) {
  const { handleSubmit, register } = useForm<UpdatePostFormValues>({
    defaultValues: {
      title: initialTitle,
      body_markdown: initialBody,
    },
  })
  const mutation = useUpdatePostMutation(accessToken, postId)

  return (
    <form className="auth-form stack-md" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <label className="field-stack">
        <span>Edit title</span>
        <input className="text-input" {...register('title')} type="text" />
      </label>
      <label className="field-stack">
        <span>Edit body</span>
        <textarea className="text-input text-area" {...register('body_markdown')} rows={5} />
      </label>
      <button className="secondary-button auth-submit" disabled={mutation.isPending} type="submit">
        {mutation.isPending ? 'Saving…' : 'Save updates'}
      </button>
      {mutation.isError ? <p className="error-text">Unable to update the post.</p> : null}
      {mutation.isSuccess ? <p className="success-text">Post updated.</p> : null}
    </form>
  )
}
