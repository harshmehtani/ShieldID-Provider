import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Warning, CheckCircle } from '@phosphor-icons/react'

export interface ConfirmDialogProps {
  isOpen?: boolean
  open?: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message?: string
  children?: React.ReactNode
  confirmText?: string
  confirmLabel?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  confirmVariant?: 'danger' | 'primary'
  loading?: boolean
  confirmDisabled?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  open,
  onClose,
  onConfirm,
  title,
  message,
  children,
  confirmText = 'Confirm',
  confirmLabel,
  cancelText = 'Cancel',
  variant = 'danger',
  confirmVariant,
  loading = false,
  confirmDisabled = false,
}) => {
  const visible = open ?? isOpen ?? false
  const actionVariant = confirmVariant ?? variant
  return (
    <Modal
      isOpen={visible}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={actionVariant === 'danger' ? 'destructive' : 'primary'}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            loading={loading}
            disabled={confirmDisabled}
          >
            {confirmLabel || confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5 py-1">
        <div
          className={`shrink-0 p-2 rounded-full ${
            actionVariant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
          }`}
        >
          {actionVariant === 'danger' ? (
            <Warning weight="fill" className="w-6 h-6" />
          ) : (
            <CheckCircle weight="fill" className="w-6 h-6" />
          )}
        </div>
        <div className="text-sm text-slate-600 leading-relaxed pt-0.5">{message || children}</div>
      </div>
    </Modal>
  )
}
