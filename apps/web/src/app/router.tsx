import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '../components/shell/AppLayout'
import { LoginPage } from '../features/auth/routes/LoginPage'
import { RegisterPage } from '../features/auth/routes/RegisterPage'
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
    ],
  },
])
