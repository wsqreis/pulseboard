import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import { verifyEmail } from '../api'
import { AuthCard } from '../components/AuthCard'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])

  const mutation = useMutation({
    mutationFn: async () => verifyEmail(token),
  })

  return (
    <AuthCard
      eyebrow="Verification"
      title="Verify your email"
      description="Use the token from your verification link to activate your account."
    >
      <div className="stack-sm">
        <p className="inline-note">Verification token: {token || 'Missing token'}</p>
        <button
          className="primary-button auth-submit"
          disabled={token.length === 0 || mutation.isPending}
          onClick={() => mutation.mutate()}
          type="button"
        >
          {mutation.isPending ? 'Verifying…' : 'Verify email'}
        </button>
        {mutation.isSuccess ? <p className="success-text">Email verified.</p> : null}
        {mutation.isError ? <p className="error-text">Unable to verify this token.</p> : null}
      </div>
    </AuthCard>
  )
}
