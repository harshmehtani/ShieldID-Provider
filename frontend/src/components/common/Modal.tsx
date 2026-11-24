import React, { useEffect } from 'react'
import { XCircle } from '@phosphor-icons/react'

export interface ModalProps {
  isOpen?: boolean
  open?: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
  size,
}) => {
  const visible = open ?? isOpen ?? false
  const width = size ?? maxWidth
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        onClose()
      }
    }
    if (visible) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [visible, onClose])

  if (!visible) return null

  let maxW = 'max-w-md'
  if (width === 'sm') maxW = 'max-w-sm'
  if (width === 'lg') maxW = 'max-w-lg'
  if (width === 'xl') maxW = 'max-w-xl'
  if (width === '2xl') maxW = 'max-w-2xl'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full ${maxW} border border-slate-200`}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md"
            >
              <XCircle weight="fill" className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[calc(85vh-140px)] overflow-y-auto text-sm text-slate-700">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
