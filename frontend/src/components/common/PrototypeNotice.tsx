import React from 'react'
import { Info, ShieldCheck } from '@phosphor-icons/react'

export interface PrototypeNoticeProps {
  className?: string
  compact?: boolean
  text?: string
}

export const PrototypeNotice: React.FC<PrototypeNoticeProps> = ({
  className = '',
  compact = false,
  text,
}) => {
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
      >
        <ShieldCheck weight="fill" className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="font-medium">
          {text || 'Prototype demo — data and checks may be simulated'}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 flex items-start gap-3 ${className}`}
    >
      <Info weight="fill" className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
      <div className="text-xs text-blue-900 leading-relaxed">
        <span className="font-semibold text-blue-950 block mb-0.5">
          Prototype notice
        </span>
        {text ||
          'This demo stores its data in this browser. It does not connect to a production identity service, and signature or registry checks may be simulated.'}
      </div>
    </div>
  )
}
