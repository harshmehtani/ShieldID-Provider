import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import type { Role } from '@/types'

export interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser } = useApp()

  if (!currentUser) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/access-denied" replace />
  }

  return <Outlet />
}
