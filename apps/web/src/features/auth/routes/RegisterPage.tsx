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
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>()
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
          <input className="text-input" {...register('display_name', { required: 'Display name is required.', minLength: { value: 2, message: 'Display name should have at least 2 characters.' } })} type="text" />
          {errors.display_name ? <p className="error-text">{errors.display_name.message}</p> : null}
        </label>
        <label className="field-stack">
          <span>Email</span>
          <input className="text-input" {...register('email', { required: 'Email is required.' })} type="email" />
          {errors.email ? <p className="error-text">{errors.email.message}</p> : null}
        </label>
        <label className="field-stack">
          <span>Password</span>
          <input className="text-input" {...register('password', { required: 'Password is required.', minLength: { value: 8, message: 'Password should have at least 8 characters.' } })} type="password" />
          {errors.password ? <p className="error-text">{errors.password.message}</p> : null}
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
        {mutation.isError ? <p className="error-text">{mutation.error.message}</p> : null}
      </form>
    </AuthCard>
  )
}
