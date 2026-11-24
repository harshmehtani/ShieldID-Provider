import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldWarning, ArrowLeft, House } from '@phosphor-icons/react'
import { Button } from '@/components/common/Button'
import { useApp } from '@/context/AppContext'
import { homeFor, ROLE_LABEL } from '@/lib/access'

export const AccessDeniedPage: React.FC = () => {
  const { currentUser } = useApp()
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
        <ShieldWarning weight="fill" className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Access Restricted</h1>
      <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
        Your current session as{' '}
        <span className="font-semibold text-slate-900">
          {currentUser ? ROLE_LABEL[currentUser.role] : 'Guest'}
        </span>{' '}
        does not have permission to access this protected resource. Role-based access control (RBAC) is enforced.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft weight="bold" className="w-4 h-4" />}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(currentUser ? homeFor(currentUser.role) : '/login')}
          icon={<House weight="fill" className="w-4 h-4" />}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  )
}
