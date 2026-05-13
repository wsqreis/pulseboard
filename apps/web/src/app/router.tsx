import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '../components/shell/AppLayout'
import { ForgotPasswordPage } from '../features/auth/routes/ForgotPasswordPage'
import { LoginPage } from '../features/auth/routes/LoginPage'
import { RegisterPage } from '../features/auth/routes/RegisterPage'
import { ResetPasswordPage } from '../features/auth/routes/ResetPasswordPage'
import { VerifyEmailPage } from '../features/auth/routes/VerifyEmailPage'
import { CommunitiesIndexPage } from '../features/communities/routes/CommunitiesIndexPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate replace to="/communities" /> },
      { path: 'communities', element: <CommunitiesIndexPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },
])
