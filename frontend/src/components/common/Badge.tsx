import React from 'react'

export type BadgeVariant =
  | 'active'
  | 'issued'
  | 'pass'
  | 'success'
  | 'pending'
  | 'pending_review'
  | 'invited'
  | 'warn'
  | 'rejected'
  | 'revoked'
  | 'suspended'
  | 'fail'
  | 'danger'
  | 'expired'
  | 'inactive'
  | 'neutral'
  | 'skipped'
  | 'info'
  | 'blue'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant | string
  className?: string
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  dot = true,
}) => {
  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200'
  let dotColor = 'bg-slate-400'

  switch (variant) {
    case 'active':
    case 'issued':
    case 'pass':
    case 'success':
    case 'checks_passed':
      styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200'
      dotColor = 'bg-emerald-500'
      break

    case 'pending':
    case 'pending_review':
    case 'invited':
    case 'warn':
      styleClasses = 'bg-amber-50 text-amber-800 border-amber-200'
      dotColor = 'bg-amber-500'
      break

    case 'rejected':
    case 'revoked':
    case 'suspended':
    case 'fail':
    case 'danger':
    case 'proof_mismatch':
    case 'resolution_failed':
      styleClasses = 'bg-rose-50 text-rose-800 border-rose-200'
      dotColor = 'bg-rose-500'
      break

    case 'expired':
      // Distinct purple/violet to clearly distinguish from revoked as required by prompt
      styleClasses = 'bg-purple-50 text-purple-800 border-purple-200'
      dotColor = 'bg-purple-500'
      break

    case 'info':
    case 'blue':
      styleClasses = 'bg-blue-50 text-blue-800 border-blue-200'
      dotColor = 'bg-blue-500'
      break

    case 'inactive':
    case 'neutral':
    case 'skipped':
    default:
      styleClasses = 'bg-slate-100 text-slate-700 border-slate-200'
      dotColor = 'bg-slate-400'
      break
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-md border tracking-tight ${styleClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  )
}
