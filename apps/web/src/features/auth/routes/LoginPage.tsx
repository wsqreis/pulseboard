import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { login } from '../api'
import { AuthCard } from '../components/AuthCard'
import { useAuthSession } from '../useAuthSession'

interface LoginFormValues {
  email: string
  password: string
}

export function LoginPage() {
  const { setCurrentUser, setSession } = useAuthSession()
  const { handleSubmit, register } = useForm<LoginFormValues>()
  const mutation = useMutation({
    mutationFn: async (values: LoginFormValues) => login(values),
    onSuccess(data) {
      setSession(data.tokens.access_token, data.tokens.refresh_token)
      setCurrentUser(data.user)
    },
  })

  return (
    <AuthCard
      eyebrow="Auth"
      title="Log in"
      description="Access your communities, conversations, and moderation tools."
    >
      <form className="auth-form stack-md" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <label className="field-stack">
          <span>Email</span>
          <input className="text-input" {...register('email')} type="email" />
        </label>
        <label className="field-stack">
          <span>Password</span>
          <input className="text-input" {...register('password')} type="password" />
        </label>
        <button className="primary-button auth-submit" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? 'Logging in…' : 'Log in'}
        </button>
        <div className="inline-links">
          <Link className="text-link" to="/forgot-password">
            Forgot password?
          </Link>
          <Link className="text-link" to="/register">
            Need an account?
          </Link>
        </div>
        {mutation.isSuccess ? <p className="success-text">Session started.</p> : null}
        {mutation.isError ? <p className="error-text">Unable to log in with those credentials.</p> : null}
      </form>
    </AuthCard>
  )
}
