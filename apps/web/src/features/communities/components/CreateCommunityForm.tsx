import { useForm } from 'react-hook-form'

import { useCreateCommunityMutation } from '../hooks'

interface CreateCommunityFormValues {
  name: string
  description: string
}

export function CreateCommunityForm({ accessToken }: { accessToken: string | null }) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<CreateCommunityFormValues>()
  const mutation = useCreateCommunityMutation(accessToken)

  return (
    <section className="panel form-panel">
      <h2 className="section-title">Create a community</h2>
      <p className="section-copy">Start a new space for people who share a goal or interest.</p>
      <form
        className="auth-form stack-md"
        onSubmit={handleSubmit(async (values) => {
          await mutation.mutateAsync({
            name: values.name,
            description: values.description,
            visibility: 'public',
          })
          reset()
        })}
      >
        <label className="field-stack">
          <span>Name</span>
          <input className="text-input" {...register('name', { required: 'Name is required.', minLength: { value: 3, message: 'Name should have at least 3 characters.' } })} type="text" />
          {errors.name ? <p className="error-text">{errors.name.message}</p> : null}
        </label>
        <label className="field-stack">
          <span>Description</span>
          <textarea className="text-input text-area" {...register('description', { required: 'Description is required.', minLength: { value: 10, message: 'Description should have at least 10 characters.' } })} rows={4} />
          {errors.description ? <p className="error-text">{errors.description.message}</p> : null}
        </label>
        <button className="primary-button auth-submit" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? 'Creating…' : 'Create community'}
        </button>
        {mutation.isError ? <p className="error-text">Unable to create the community.</p> : null}
        {mutation.isSuccess ? <p className="success-text">Community created.</p> : null}
      </form>
    </section>
  )
}
