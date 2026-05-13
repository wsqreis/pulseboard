import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'

import { resetPassword } from '../api'
import { AuthCard } from '../components/AuthCard'

interface ResetPasswordFormValues {
  password: string
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const { handleSubmit, register } = useForm<ResetPasswordFormValues>()
  const mutation = useMutation({
    mutationFn: async (values: ResetPasswordFormValues) =>
      resetPassword({ token, password: values.password }),
  })

  return (
    <AuthCard
      eyebrow="Password reset"
      title="Choose a new password"
      description="Use your reset link token to set a new password."
    >
      <form className="auth-form stack-md" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <label className="field-stack">
          <span>New password</span>
          <input className="text-input" {...register('password')} type="password" />
        </label>
        <button
          className="primary-button auth-submit"
          disabled={token.length === 0 || mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? 'Resetting…' : 'Reset password'}
        </button>
        {mutation.isSuccess ? <p className="success-text">Password reset complete.</p> : null}
        {mutation.isError ? <p className="error-text">Unable to reset password.</p> : null}
      </form>
    </AuthCard>
  )
}
