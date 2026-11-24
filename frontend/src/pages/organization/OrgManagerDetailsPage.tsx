import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  User,
  ArrowLeft,
  Calendar,
  Envelope,
  IdentificationCard,
  WarningCircle,
  Prohibit,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

export const OrgManagerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, currentUser, deactivateIdentityManager } = useApp()

  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)

  if (!currentUser || !currentUser.organizationId) {
    return null
  }

  const manager = state.users.find(
    (u) => u.id === id && u.role === 'identity_manager' && u.organizationId === currentUser.organizationId,
  )

  if (!manager) {
    return (
      <div className="p-8 text-center text-sm text-[#64748B]">
        <p className="mb-4">Identity Manager record not found.</p>
        <Link to="/org/managers" className="text-[#2563EB] hover:underline font-semibold">
          Return to Roster
        </Link>
      </div>
    )
  }

  const orgCitizensCount = state.identities.filter(
    (i) => i.createdByUserId === manager.id,
  ).length

  const handleDeactivate = () => {
    deactivateIdentityManager(manager.id)
    setShowDeactivateDialog(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to="/org/managers"
        className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
      >
        <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
        <span>Back to Identity Managers</span>
      </Link>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-base">
              {manager.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">{manager.name}</h1>
              <p className="text-xs text-[#64748B]">Identity Manager Delegate</p>
            </div>
          </div>

          <Badge variant={manager.status === 'active' ? 'green' : manager.status === 'invited' ? 'amber' : 'red'}>
            {manager.status === 'active' ? 'Active' : manager.status === 'invited' ? 'Invited' : 'Deactivated'}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <Envelope weight="bold" className="w-3.5 h-3.5" />
                <span>Email Address</span>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">{manager.email}</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <Calendar weight="bold" className="w-3.5 h-3.5" />
                <span>Date Added</span>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">
                {new Date(manager.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-[#64748B]">Citizens Registered by This Manager</p>
              <p className="text-xl font-bold text-[#0F172A] mt-0.5">{orgCitizensCount}</p>
            </div>
            <IdentificationCard weight="fill" className="w-8 h-8 text-[#2563EB]" />
          </div>

          {/* Deactivation action */}
          {manager.status === 'active' && (
            <div className="pt-6 border-t border-[#E2E8F0] flex justify-end">
              <button
                type="button"
                onClick={() => setShowDeactivateDialog(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-md transition-colors"
              >
                <Prohibit weight="bold" className="w-4 h-4" />
                <span>Deactivate Manager</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeactivateDialog}
        onClose={() => setShowDeactivateDialog(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Identity Manager"
        confirmLabel="Deactivate Account"
        confirmVariant="danger"
      >
        <p className="text-xs text-[#334155] leading-relaxed">
          Are you sure you want to deactivate <strong>{manager.name}</strong>?
          They will immediately lose system access. Credentials they issued and their audit history will remain unchanged.
        </p>
      </ConfirmDialog>
    </div>
  )
}
