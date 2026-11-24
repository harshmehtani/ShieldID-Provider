import React from 'react'

export interface StatCardProps {
  title?: string
  label?: string
  value: string | number
  icon: React.ReactNode
  iconColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate'
  subtext?: string
  hint?: string
  badge?: React.ReactNode
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  label,
  value,
  icon,
  iconColor = 'blue',
  subtext,
  hint,
  badge,
  onClick,
}) => {
  let iconBg = 'bg-blue-50 text-blue-600'
  if (iconColor === 'emerald') iconBg = 'bg-emerald-50 text-emerald-600'
  if (iconColor === 'amber') iconBg = 'bg-amber-50 text-amber-600'
  if (iconColor === 'purple') iconBg = 'bg-purple-50 text-purple-600'
  if (iconColor === 'slate') iconBg = 'bg-slate-100 text-slate-600'

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-slate-200 p-5 shadow-2xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600">{label || title}</span>
        <div className={`p-2 rounded-md ${iconBg}`}>{icon}</div>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {badge}
      </div>
      {(hint || subtext) && <p className="mt-2 text-xs text-slate-500">{hint || subtext}</p>}
    </div>
  )
}
