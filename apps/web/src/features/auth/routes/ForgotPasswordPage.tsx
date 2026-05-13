import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { forgotPassword } from '../api'
import { AuthCard } from '../components/AuthCard'

interface ForgotPasswordFormValues {
  email: string
}

export function ForgotPasswordPage() {
  const { handleSubmit, register } = useForm<ForgotPasswordFormValues>()
  const mutation = useMutation({
    mutationFn: async (values: ForgotPasswordFormValues) => forgotPassword(values.email),
  })

  return (
    <AuthCard
      eyebrow="Password reset"
      title="Request a reset"
      description="Start a password reset flow for an existing account."
    >
      <form className="auth-form stack-md" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <label className="field-stack">
          <span>Email</span>
          <input className="text-input" {...register('email')} type="email" />
        </label>
        <button className="primary-button auth-submit" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? 'Sending…' : 'Send reset email'}
        </button>
        {mutation.isSuccess ? <p className="success-text">Reset flow started.</p> : null}
        {mutation.isError ? <p className="error-text">Unable to send reset email.</p> : null}
      </form>
    </AuthCard>
  )
}
