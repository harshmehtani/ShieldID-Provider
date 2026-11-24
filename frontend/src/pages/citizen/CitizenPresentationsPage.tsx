import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShareNetwork,
  PlusCircle,
  QrCode,
  Warning,
  CheckCircle,
  Copy,
  Check,
  ShieldCheck,
  Eye,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate, formatDateTime } from '@/lib/dates'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'

export const CitizenPresentationsPage: React.FC = () => {
  const { state, currentUser, createPresentation, revokePresentation } = useApp()
  const navigate = useNavigate()

  const myIdentity = state.identities.find(
    (i) => i.userId === currentUser?.id || i.id === currentUser?.identityId,
  )

  const myCredentials = state.credentials.filter(
    (c) => c.identityId === myIdentity?.id || (myIdentity?.did && c.subjectDid === myIdentity.did),
  )

  const myPresentations = state.presentations.filter((p) => p.ownerUserId === currentUser?.id)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedCredId, setSelectedCredId] = useState(myCredentials[0]?.id || '')
  const [selectedClaims, setSelectedClaims] = useState<string[]>([])
  const [purpose, setPurpose] = useState('Verification for service access')
  const [durationHours, setDurationHours] = useState(24)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeQrCode, setActiveQrCode] = useState<string | null>(null)

  const targetCred = myCredentials.find((c) => c.id === selectedCredId) || myCredentials[0]

  const handleOpenCreate = () => {
    if (targetCred) {
      setSelectedClaims(Object.keys(targetCred.claims))
    }
    setCreateModalOpen(true)
  }

  const handleCredChange = (credId: string) => {
    setSelectedCredId(credId)
    const cred = myCredentials.find((c) => c.id === credId)
    if (cred) {
      setSelectedClaims(Object.keys(cred.claims))
    }
  }

  const toggleClaim = (claimKey: string) => {
    setSelectedClaims((prev) =>
      prev.includes(claimKey) ? prev.filter((k) => k !== claimKey) : [...prev, claimKey],
    )
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCredId || selectedClaims.length === 0) return

    createPresentation({
      credentialId: selectedCredId,
      disclosedClaims: selectedClaims,
      purpose,
      durationHours: Number(durationHours),
    })

    setCreateModalOpen(false)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Credential Presentation & Selective Disclosure
          </h1>
          <p className="text-sm text-slate-500">
            Share verifiable claims with third parties while keeping undisclosed attributes private
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          disabled={myCredentials.length === 0}
          icon={<PlusCircle weight="fill" className="w-4 h-4" />}
        >
          Create Presentation Share
        </Button>
      </div>

      <PrototypeNotice text="This prototype stores a local share code and selected claim names. It does not create a cryptographic selective-disclosure proof or a verifier-accessible link." />

      {/* Presentations Table */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-2xs">
        {myPresentations.length === 0 ? (
          <EmptyState
            icon={<ShareNetwork weight="fill" className="w-8 h-8 text-slate-400" />}
            title="No active presentations"
            description="You have not created any presentation share codes yet. Create a share to present selected claims to a verifier."
            actionLabel="Create Presentation Share"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Share Code</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Disclosed Claims</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myPresentations.map((pre) => {
                  const isRevoked = Boolean(pre.revokedAt)
                  const isExpired = new Date(pre.expiresAt) < new Date()
                  const status = isRevoked ? 'revoked' : isExpired ? 'expired' : 'active'

                  return (
                    <tr key={pre.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-blue-700">
                          <span>{pre.code}</span>
                          <button
                            type="button"
                            onClick={() => copyCode(pre.code)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            {copiedCode === pre.code ? (
                              <Check weight="bold" className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy weight="fill" className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Ref: {pre.credentialId}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 font-medium max-w-xs">
                        {pre.purpose}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {pre.disclosedClaims.map((claim) => (
                            <span
                              key={claim}
                              className="px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200"
                            >
                              {claim}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono whitespace-nowrap">
                        {formatDateTime(pre.expiresAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={status}>{status.toUpperCase()}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveQrCode(pre.code)}
                          icon={<QrCode weight="fill" className="w-3.5 h-3.5" />}
                        >
                          QR
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/verify')}
                          icon={<ShieldCheck weight="fill" className="w-3.5 h-3.5 text-blue-600" />}
                        >
                          Verify
                        </Button>
                        {!isRevoked && !isExpired && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => revokePresentation(pre.id)}
                            icon={<Warning weight="fill" className="w-3.5 h-3.5" />}
                          >
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Presentation Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Presentation Share"
        subtitle="Configure selective disclosure and generate a shareable token"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Select
            label="1. Select Credential to Present"
            value={selectedCredId}
            onChange={(e) => handleCredChange(e.target.value)}
            required
          >
            {myCredentials.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title || c.type} ({c.id})
              </option>
            ))}
          </Select>

          {targetCred && (
            <div>
              <span className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                2. Selectively Disclose Attributes (Privacy Control)
              </span>
              <p className="text-[11px] text-slate-500 mb-2.5">
                Check only the attributes you wish to expose. Unchecked claims will remain completely hidden.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {Object.entries(targetCred.claims).map(([key, value]) => {
                  const isChecked = selectedClaims.includes(key)
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-2 p-1.5 rounded-sm hover:bg-white transition-colors cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleClaim(key)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 capitalize block truncate">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">{value}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <Input
            label="3. Stated Purpose of Presentation"
            placeholder="e.g. Identity verification for rental lease agreement"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />

          <Select
            label="4. Share Validity Duration"
            value={String(durationHours)}
            onChange={(e) => setDurationHours(Number(e.target.value))}
          >
            <option value="1">1 Hour</option>
            <option value="24">24 Hours (1 Day)</option>
            <option value="72">72 Hours (3 Days)</option>
            <option value="168">7 Days (1 Week)</option>
          </Select>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={selectedClaims.length === 0}
              icon={<ShareNetwork weight="fill" className="w-4 h-4" />}
            >
              Generate Share Token ({selectedClaims.length} Claims)
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Presentation Modal */}
      {activeQrCode && (
        <Modal
          isOpen={Boolean(activeQrCode)}
          onClose={() => setActiveQrCode(null)}
          title="Presentation Token & QR Code"
          maxWidth="sm"
        >
          <div className="text-center py-4 space-y-4">
            <div className="w-48 h-48 mx-auto bg-slate-900 rounded-lg p-3 flex flex-col items-center justify-center text-white space-y-2">
              <QrCode weight="fill" className="w-32 h-32 text-white" />
              <span className="text-[10px] font-mono text-slate-300">Scan to Verify</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase">Presentation Code</span>
              <code className="text-sm font-bold text-blue-700 font-mono block mt-0.5">
                {activeQrCode}
              </code>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => {
                copyCode(activeQrCode)
                setActiveQrCode(null)
              }}
              icon={<Copy weight="fill" className="w-4 h-4" />}
            >
              Copy Code & Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
