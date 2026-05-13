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
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<UpdatePostFormValues>({
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
        <input className="text-input" {...register('title', { required: 'Title is required.', minLength: { value: 3, message: 'Title should have at least 3 characters.' } })} type="text" />
        {errors.title ? <p className="error-text">{errors.title.message}</p> : null}
      </label>
      <label className="field-stack">
        <span>Edit body</span>
        <textarea className="text-input text-area" {...register('body_markdown', { required: 'Body is required.', minLength: { value: 10, message: 'Body should have at least 10 characters.' } })} rows={5} />
        {errors.body_markdown ? <p className="error-text">{errors.body_markdown.message}</p> : null}
      </label>
      <button className="secondary-button auth-submit" disabled={mutation.isPending} type="submit">
        {mutation.isPending ? 'Saving…' : 'Save updates'}
      </button>
      {mutation.isError ? <p className="error-text">Unable to update the post.</p> : null}
      {mutation.isSuccess ? <p className="success-text">Post updated.</p> : null}
    </form>
  )
}
