import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Certificate,
  ArrowLeft,
  DownloadSimple,
  Prohibit,
  WarningCircle,
  CaretDown,
  CaretUp,
  User,
  Buildings,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { JsonViewer } from '@/components/common/JsonViewer'
import { buildCredentialJson, registryStatus } from '@/lib/credential'
import { formatOptionalDate } from '@/lib/dates'

export const ImCredentialDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { state, currentUser, revokeCredential } = useApp()

  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const [revocationReason, setRevocationReason] = useState('')
  const [showProofJson, setShowProofJson] = useState(false)

  if (!currentUser || !currentUser.organizationId) {
    return null
  }

  const credential = state.credentials.find(
    (c) => c.id === id && c.organizationId === currentUser.organizationId,
  )

  if (!credential) {
    return (
      <div className="p-8 text-center text-sm text-[#64748B]">
        <p className="mb-4">Credential record not found.</p>
        <Link to="/im/credentials" className="text-[#2563EB] hover:underline font-semibold">
          Return to Credentials
        </Link>
      </div>
    )
  }

  const credentialStatus = registryStatus(credential)

  const handleDownload = () => {
    const credJson = buildCredentialJson(credential)
    const blob = new Blob([JSON.stringify(credJson, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `credential-${credential.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRevoke = () => {
    if (!revocationReason.trim()) return
    revokeCredential(credential.id, revocationReason.trim())
    setShowRevokeDialog(false)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/im/credentials"
        className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
      >
        <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
        <span>Back to Credentials</span>
      </Link>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Certificate weight="fill" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">{credential.title}</h1>
              <p className="text-xs text-[#64748B]">{credential.type}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge variant={credentialStatus}>
              {credentialStatus === 'issued' ? 'Active' : credentialStatus === 'expired' ? 'Expired' : 'Revoked'}
            </Badge>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FF] text-[#2563EB] hover:bg-blue-100 rounded-md text-xs font-semibold transition-colors"
            >
              <DownloadSimple weight="bold" className="w-4 h-4" />
              <span>Download JSON</span>
            </button>

            {credentialStatus === 'issued' && (
              <button
                type="button"
                onClick={() => setShowRevokeDialog(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-md text-xs font-semibold transition-colors"
              >
                <Prohibit weight="bold" className="w-4 h-4" />
                <span>Revoke</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Credential Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-[#64748B] block mb-0.5">Credential ID:</span>
            <span className="font-mono font-semibold text-[#0F172A] break-all">{credential.id}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-[#64748B] block mb-0.5">Issued Date:</span>
            <span className="font-semibold text-[#0F172A]">{new Date(credential.issuedAt).toLocaleDateString()}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-[#64748B] block mb-0.5">Expiration Date:</span>
            <span className="font-semibold text-[#0F172A]">{formatOptionalDate(credential.expiresAt)}</span>
          </div>
        </div>

        {/* 2 & 3. Subject and Issuer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 border border-[#E2E8F0] rounded-lg space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
              <User weight="fill" className="w-4 h-4 text-[#2563EB]" />
              <span>Subject (Citizen)</span>
            </div>
            <p className="text-sm font-bold text-[#0F172A]">{credential.subjectName}</p>
            <p className="font-mono text-xs text-slate-600 break-all select-all">{credential.subjectDid}</p>
          </div>

          <div className="p-4 border border-[#E2E8F0] rounded-lg space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
              <Buildings weight="fill" className="w-4 h-4 text-[#2563EB]" />
              <span>Issuing Organization</span>
            </div>
            <p className="text-sm font-bold text-[#0F172A]">{credential.issuerName}</p>
            <p className="font-mono text-xs text-slate-600 break-all select-all">{credential.issuerDid}</p>
          </div>
        </div>

        {/* 4. Claims */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
            Attested Claims Data
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200/70 text-xs">
            {Object.entries(credential.claims).map(([key, val]) => (
              <div key={key} className="px-4 py-3 flex justify-between">
                <span className="font-medium text-[#64748B] capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="font-semibold text-[#0F172A]">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Cryptographic Proof */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowProofJson(!showProofJson)}
            className="w-full flex items-center justify-between text-xs font-bold text-[#0F172A] uppercase tracking-wider py-2"
          >
            <span>Cryptographic Proof Header</span>
            {showProofJson ? <CaretUp weight="bold" className="w-4 h-4" /> : <CaretDown weight="bold" className="w-4 h-4" />}
          </button>

          {showProofJson && (
            <div className="mt-3">
              <JsonViewer data={credential.proof} />
            </div>
          )}
        </div>
      </div>

      {/* Revocation Dialog */}
      <ConfirmDialog
        open={showRevokeDialog}
        onClose={() => setShowRevokeDialog(false)}
        onConfirm={handleRevoke}
        title="Revoke Verifiable Credential"
        confirmLabel="Confirm Permanent Revocation"
        confirmVariant="danger"
        confirmDisabled={!revocationReason.trim()}
      >
        <div className="space-y-3">
          <p className="text-xs text-[#334155] leading-relaxed">
            Revoking this credential will permanently mark it as revoked on the public verification registry. This action cannot be undone.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Revocation Reason (Mandatory) *
            </label>
            <textarea
              required
              rows={3}
              value={revocationReason}
              onChange={(e) => setRevocationReason(e.target.value)}
              placeholder="e.g. Invalidation of credential claims, diploma rescinded, or operator error."
              className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  )
}
