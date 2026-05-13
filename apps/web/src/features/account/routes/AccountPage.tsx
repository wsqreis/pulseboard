import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { apiClient } from '../../../lib/api/client'
import { useAuthSession } from '../../auth/useAuthSession'

interface ChangePasswordValues {
  current_password: string
  new_password: string
}

async function changePassword(
  accessToken: string,
  input: ChangePasswordValues,
) {
  const { data, error } = await apiClient.POST('/api/v1/auth/change-password', {
    body: input,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (error !== undefined || data === undefined) {
    throw new Error('Unable to change password right now.')
  }

  return data
}

export function AccountPage() {
  const { accessToken, currentUser } = useAuthSession()
  const { handleSubmit, register, reset } = useForm<ChangePasswordValues>()
  const mutation = useMutation({
    mutationFn: async (values: ChangePasswordValues) => {
      if (accessToken === null) {
        throw new Error('Sign in to change your password.')
      }

      return changePassword(accessToken, values)
    },
    onSuccess() {
      reset()
    },
  })

  return (
    <>
      <section className="panel hero-panel">
        <span className="status-pill">Account</span>
        <h1 className="section-title">{currentUser?.display_name ?? 'Your account'}</h1>
        <p className="section-copy">{currentUser?.email ?? 'Sign in to manage your profile.'}</p>
      </section>

      <section className="panel form-panel full-width-panel">
        <h2 className="section-title">Change password</h2>
        <form className="auth-form stack-md" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <label className="field-stack">
            <span>Current password</span>
            <input className="text-input" {...register('current_password')} type="password" />
          </label>
          <label className="field-stack">
            <span>New password</span>
            <input className="text-input" {...register('new_password')} type="password" />
          </label>
          <button className="primary-button auth-submit" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? 'Saving…' : 'Update password'}
          </button>
          {mutation.isSuccess ? <p className="success-text">Password updated.</p> : null}
          {mutation.isError ? <p className="error-text">Unable to update the password.</p> : null}
        </form>
      </section>
    </>
  )
}
