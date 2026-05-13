import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { register as registerAccount } from '../api'
import { AuthCard } from '../components/AuthCard'
import { useAuthSession } from '../useAuthSession'

interface RegisterFormValues {
  display_name: string
  email: string
  password: string
}

export function RegisterPage() {
  const { setCurrentUser, setSession } = useAuthSession()
  const { handleSubmit, register } = useForm<RegisterFormValues>()
  const mutation = useMutation({
    mutationFn: async (values: RegisterFormValues) =>
      registerAccount({
        display_name: values.display_name,
        email: values.email,
        password: values.password,
      }),
    onSuccess(data) {
      setSession(data.tokens.access_token, data.tokens.refresh_token)
      setCurrentUser(data.user)
    },
  })

  return (
    <AuthCard
      eyebrow="Auth"
      title="Create your account"
      description="Join Pulseboard and immediately enter the product flow after registration."
    >
      <form className="auth-form stack-md" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <label className="field-stack">
          <span>Display name</span>
          <input className="text-input" {...register('display_name')} type="text" />
        </label>
        <label className="field-stack">
          <span>Email</span>
          <input className="text-input" {...register('email')} type="email" />
        </label>
        <label className="field-stack">
          <span>Password</span>
          <input className="text-input" {...register('password')} type="password" />
        </label>
        <button className="primary-button auth-submit" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? 'Creating account…' : 'Create account'}
        </button>
        <div className="inline-links">
          <Link className="text-link" to="/login">
            Already have an account?
          </Link>
          <Link className="text-link" to="/verify-email">
            Verify email
          </Link>
        </div>
        {mutation.isSuccess ? <p className="success-text">Account created.</p> : null}
        {mutation.isError ? <p className="error-text">Unable to create the account right now.</p> : null}
      </form>
    </AuthCard>
  )
}
