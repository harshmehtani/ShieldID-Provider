import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ListChecks,
  CheckCircle,
  XCircle,
  Eye,
  IdentificationCard,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { Textarea } from '@/components/common/Textarea'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate } from '@/lib/dates'
import type { Identity } from '@/types'

export const ImReviewQueuePage: React.FC = () => {
  const { state, currentUser, reviewIdentity } = useApp()
  const navigate = useNavigate()

  const orgId = currentUser?.organizationId || state.organizations[0]?.id
  const pending = state.identities.filter(
    (i) => i.organizationId === orgId && i.status === 'pending_review',
  )

  const [activeReviewIdentity, setActiveReviewIdentity] = useState<Identity | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDecision = (decision: 'active' | 'rejected') => {
    if (!activeReviewIdentity) return
    setLoading(true)
    setTimeout(() => {
      reviewIdentity(activeReviewIdentity.id, decision, reviewNote)
      setLoading(false)
      setActiveReviewIdentity(null)
      setReviewNote('')
    }, 300)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Identity Review Queue
        </h1>
        <p className="text-sm text-slate-500">
          Citizen identity registration submissions awaiting administrative verification & DID creation
        </p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-2xs">
        {pending.length === 0 ? (
          <EmptyState
            icon={<CheckCircle weight="fill" className="w-8 h-8 text-emerald-600" />}
            title="All submissions reviewed"
            description="The review queue is currently empty. All citizen identity registrations have been processed."
            actionLabel="View Identity Directory"
            onAction={() => navigate('/im/identities')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Citizen Name</th>
                  <th className="px-4 py-3">Email & Contact</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pending.map((idn) => (
                  <tr key={idn.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-900 block">{idn.fullName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{idn.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-800 block">{idn.email}</span>
                      <span className="text-[11px] text-slate-400">{idn.phone}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">
                      {idn.idReference}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono">
                      {formatDate(idn.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="pending">PENDING REVIEW</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/im/identities/${idn.id}`)}
                        icon={<Eye weight="fill" className="w-3.5 h-3.5" />}
                      >
                        Inspect
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setActiveReviewIdentity(idn)
                          setReviewNote('')
                        }}
                        icon={<ListChecks weight="fill" className="w-3.5 h-3.5" />}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {activeReviewIdentity && (
        <Modal
          isOpen={Boolean(activeReviewIdentity)}
          onClose={() => setActiveReviewIdentity(null)}
          title={`Review Registration: ${activeReviewIdentity.fullName}`}
          subtitle={`Citizen ID: ${activeReviewIdentity.id} | Ref: ${activeReviewIdentity.idReference}`}
          footer={
            <>
              <Button
                variant="destructive"
                size="sm"
                loading={loading}
                onClick={() => handleDecision('rejected')}
                icon={<XCircle weight="fill" className="w-4 h-4" />}
              >
                Reject Registration
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={loading}
                onClick={() => handleDecision('active')}
                icon={<CheckCircle weight="fill" className="w-4 h-4" />}
              >
                Approve & Issue DID
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block">Date of Birth:</span>
                <span className="font-semibold text-slate-800">{activeReviewIdentity.dateOfBirth}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone Number:</span>
                <span className="font-semibold text-slate-800">{activeReviewIdentity.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Address:</span>
                <span className="font-semibold text-slate-800">{activeReviewIdentity.address}</span>
              </div>
            </div>

            <Textarea
              label="Reviewer Notes (Optional)"
              placeholder="Record approval audit note or reason for rejection..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={3}
            />

            <p className="text-[11px] text-slate-500">
              Approving will automatically generate an Ed25519-backed Decentralized Identifier (DID) and publish its W3C DID document.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
