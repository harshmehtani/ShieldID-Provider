import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Question, House, ArrowLeft } from '@phosphor-icons/react'
import { Button } from '@/components/common/Button'
import { useApp } from '@/context/AppContext'
import { homeFor } from '@/lib/access'

export const NotFoundPage: React.FC = () => {
  const { currentUser } = useApp()
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
        <Question weight="fill" className="w-8 h-8" />
      </div>
      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
        404 Error
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
        The requested URL or credential route does not exist in the ShieldID Provider system.
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
