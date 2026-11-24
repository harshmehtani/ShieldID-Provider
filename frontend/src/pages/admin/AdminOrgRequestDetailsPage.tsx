import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  FolderUser,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Buildings,
  User,
  Envelope,
  Calendar,
  WarningCircle,
  Tag,
  ShieldCheck,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

export const AdminOrgRequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, approveOrganization, rejectOrganization } = useApp()

  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [approvedResult, setApprovedResult] = useState(false)

  const org = state.organizations.find((o) => o.id === id)

  if (!org) {
    return (
      <div className="p-8 text-center text-sm text-[#64748B]">
        <p className="mb-4">Organization request not found.</p>
        <Link to="/admin/requests" className="text-[#2563EB] hover:underline font-semibold">
          Return to Queue
        </Link>
      </div>
    )
  }

  const handleApprove = () => {
    const res = approveOrganization(org.id)
    if (res.ok) {
      setApprovedResult(true)
    }
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) return
    rejectOrganization(org.id, rejectionReason.trim())
    setShowRejectDialog(false)
    navigate('/admin/requests')
  }

  if (approvedResult) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-xs text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle weight="fill" className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-[#0F172A] mb-1">
            Organization Approved & Accredited
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            <strong>{org.name}</strong> can now access its approved organization account.
          </p>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-3 mb-6">
            <div>
              <span className="text-[#64748B] block mb-0.5">Nominated Identity Manager:</span>
              <span className="font-semibold text-[#0F172A] text-sm">
                {org.nominatedImName} ({org.nominatedImEmail})
              </span>
            </div>

            <p className="pt-2 border-t border-slate-200/60 text-[#64748B]">
              The organization can invite its nominated manager from the Identity Managers page after signing in.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/admin/requests"
              className="flex-1 py-2.5 px-4 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#0F172A] text-xs font-semibold rounded-md transition-colors"
            >
              Return to Requests
            </Link>
            <Link
              to="/admin/organizations"
              className="flex-1 py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors"
            >
              Approved Directory
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to="/admin/requests"
        className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
      >
        <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
        <span>Back to Organization Requests</span>
      </Link>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Buildings weight="fill" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">{org.name}</h1>
              <p className="text-xs text-[#64748B]">{org.orgType}</p>
            </div>
          </div>

          <Badge variant={org.status === 'pending' ? 'amber' : org.status === 'active' ? 'green' : 'red'}>
            {org.status === 'pending' ? 'Pending Review' : org.status === 'active' ? 'Approved' : 'Rejected'}
          </Badge>
        </div>

        {/* Institutional Attributes */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Organization Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <Envelope weight="bold" className="w-3.5 h-3.5" />
                <span>Official Email</span>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">{org.email}</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <Tag weight="bold" className="w-3.5 h-3.5" />
                <span>Organization Type</span>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">{org.orgType}</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <Calendar weight="bold" className="w-3.5 h-3.5" />
                <span>Submitted Date</span>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">
                {new Date(org.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Nominated First Identity Manager */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Nominated First Identity Manager
          </h2>

          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Manager Full Name:</span>
              <span className="font-bold text-[#0F172A] text-sm">{org.nominatedImName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Manager Email Address:</span>
              <span className="font-semibold text-[#0F172A]">{org.nominatedImEmail}</span>
            </div>
            <p className="text-[11px] text-[#64748B] pt-2 border-t border-blue-200/50">
              Upon approval, an operator account will be generated for this user with a single-use temporary password.
            </p>
          </div>
        </div>

        {/* Decision Actions (only if pending) */}
        {org.status === 'pending' && (
          <div className="pt-6 border-t border-[#E2E8F0] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowRejectDialog(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-md transition-colors"
            >
              <XCircle weight="bold" className="w-4 h-4" />
              <span>Reject Application</span>
            </button>

            <button
              type="button"
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
            >
              <CheckCircle weight="bold" className="w-4 h-4" />
              <span>Approve & Anchor DID</span>
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <ConfirmDialog
        open={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={handleReject}
        title="Reject Organization Application"
        confirmLabel="Confirm Rejection"
        confirmVariant="danger"
        confirmDisabled={!rejectionReason.trim()}
      >
        <div className="space-y-3">
          <p className="text-xs text-[#334155] leading-relaxed">
            Please enter a formal reason for rejecting this institutional application. The reason will be recorded in the audit trail.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Rejection Reason (Mandatory) *
            </label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete institutional documentation or failed accreditation verification."
              className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  )
}
