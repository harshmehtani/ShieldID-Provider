import React from 'react'
import { CheckCircle, Warning, XCircle, Info, X } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info weight="fill" className="w-5 h-5 text-blue-500 shrink-0" />
        let borderClass = 'border-blue-200 bg-white'

        if (toast.type === 'success') {
          icon = <CheckCircle weight="fill" className="w-5 h-5 text-emerald-600 shrink-0" />
          borderClass = 'border-emerald-200 bg-white'
        } else if (toast.type === 'error') {
          icon = <XCircle weight="fill" className="w-5 h-5 text-rose-600 shrink-0" />
          borderClass = 'border-rose-200 bg-white'
        } else if (toast.type === 'warning') {
          icon = <Warning weight="fill" className="w-5 h-5 text-amber-500 shrink-0" />
          borderClass = 'border-amber-200 bg-white'
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg ${borderClass} transition-all`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">{toast.title}</h4>
              {toast.message && (
                <p className="mt-0.5 text-xs text-slate-600 leading-normal">{toast.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-sm shrink-0"
            >
              <X weight="bold" className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
