import { useForm } from 'react-hook-form'

import { useCreatePostMutation } from '../hooks'

interface CreatePostFormValues {
  title: string
  body_markdown: string
}

export function CreatePostForm({
  accessToken,
  communitySlug,
  boardSlug,
}: {
  accessToken: string | null
  communitySlug: string
  boardSlug: string
}) {
  const { handleSubmit, register, reset } = useForm<CreatePostFormValues>()
  const mutation = useCreatePostMutation(accessToken, communitySlug, boardSlug)

  return (
    <section className="panel form-panel">
      <h2 className="section-title">Create a post</h2>
      <p className="section-copy">Start a conversation in this board.</p>
      <form
        className="auth-form stack-md"
        onSubmit={handleSubmit(async (values) => {
          await mutation.mutateAsync(values)
          reset()
        })}
      >
        <label className="field-stack">
          <span>Title</span>
          <input className="text-input" {...register('title')} type="text" />
        </label>
        <label className="field-stack">
          <span>Body</span>
          <textarea className="text-input text-area" {...register('body_markdown')} rows={5} />
        </label>
        <button className="primary-button auth-submit" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? 'Publishing…' : 'Publish post'}
        </button>
        {mutation.isError ? <p className="error-text">Unable to create the post.</p> : null}
        {mutation.isSuccess ? <p className="success-text">Post created.</p> : null}
      </form>
    </section>
  )
}
