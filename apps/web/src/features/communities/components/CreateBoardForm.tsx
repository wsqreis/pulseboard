import { useForm } from 'react-hook-form'

import { useCreateBoardMutation } from '../hooks'

interface CreateBoardFormValues {
  name: string
  description: string
}

export function CreateBoardForm({
  accessToken,
  slug,
}: {
  accessToken: string | null
  slug: string
}) {
  const { handleSubmit, register, reset } = useForm<CreateBoardFormValues>()
  const mutation = useCreateBoardMutation(accessToken, slug)

  return (
    <section className="panel form-panel">
      <h2 className="section-title">Create a board</h2>
      <p className="section-copy">Add a dedicated space for a recurring conversation.</p>
      <form
        className="auth-form stack-md"
        onSubmit={handleSubmit(async (values) => {
          await mutation.mutateAsync({
            name: values.name,
            description: values.description,
            sort_order: 0,
          })
          reset()
        })}
      >
        <label className="field-stack">
          <span>Name</span>
          <input className="text-input" {...register('name')} type="text" />
        </label>
        <label className="field-stack">
          <span>Description</span>
          <textarea className="text-input text-area" {...register('description')} rows={4} />
        </label>
        <button className="primary-button auth-submit" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? 'Creating…' : 'Create board'}
        </button>
        {mutation.isError ? <p className="error-text">Unable to create the board.</p> : null}
        {mutation.isSuccess ? <p className="success-text">Board created.</p> : null}
      </form>
    </section>
  )
}
