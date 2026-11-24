import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Warning,
  Certificate,
  CheckCircle,
  Eye,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { Select } from '@/components/common/Select'
import { Textarea } from '@/components/common/Textarea'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { formatDateTime } from '@/lib/dates'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'
import { registryStatus } from '@/lib/credential'

export const ImRevocationPage: React.FC = () => {
  const { state, currentUser, revokeCredential } = useApp()
  const navigate = useNavigate()

  const orgId = currentUser?.organizationId || state.organizations[0]?.id
  const orgCreds = state.credentials.filter((c) => c.organizationId === orgId)
  const activeCreds = orgCreds.filter((c) => registryStatus(c) === 'issued')

  const [selectedCredId, setSelectedCredId] = useState(activeCreds[0]?.id || '')
  const [reason, setReason] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCred = orgCreds.find((c) => c.id === selectedCredId)

  const handleInitiateRevoke = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!selectedCredId) {
      setError('Please select an active credential to revoke.')
      return
    }
    if (!reason.trim()) {
      setError('Please provide a specific revocation reason.')
      return
    }
    setConfirmOpen(true)
  }

  const handleConfirmRevoke = () => {
    if (!selectedCredId) return
    revokeCredential(selectedCredId, reason.trim())
    setConfirmOpen(false)
    setReason('')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Credential Revocation Management
        </h1>
        <p className="text-sm text-slate-500">
          Revoke invalid, expired, or withdrawn verifiable credentials and publish revocation registry entries
        </p>
      </div>

      <PrototypeNotice text="This demo records revocation in local app data. It does not publish to an issuer registry; the public file checker only reads status already embedded in an uploaded file." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revocation Form (1 col) */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-rose-800">
            <Warning weight="fill" className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Revoke Credential
            </h3>
          </div>

          {error && (
            <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleInitiateRevoke} className="space-y-4 text-xs">
            <Select
              label="Select Active Credential"
              value={selectedCredId}
              onChange={(e) => setSelectedCredId(e.target.value)}
              required
            >
              {activeCreds.length === 0 ? (
                <option value="">No active credentials available</option>
              ) : (
                activeCreds.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.subjectName} — {c.type} ({c.id})
                  </option>
                ))
              )}
            </Select>

            {selectedCred && (
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-1 text-slate-600">
                <p>
                  <span className="font-semibold text-slate-900">Subject:</span> {selectedCred.subjectName}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Type:</span> {selectedCred.type}
                </p>
                <p className="font-mono text-[10px] text-slate-400 truncate">
                  DID: {selectedCred.subjectDid}
                </p>
              </div>
            )}

            <Textarea
              label="Revocation Reason"
              placeholder="e.g. Identity record updated, employment contract ended, or key compromised..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />

            <Button
              type="submit"
              variant="destructive"
              className="w-full"
              disabled={activeCreds.length === 0}
              icon={<Warning weight="fill" className="w-4 h-4" />}
            >
              Revoke Selected Credential
            </Button>
          </form>
        </div>

        {/* Revocation Registry History (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Revocation History ({state.revocations.length})
              </h3>
              <p className="text-xs text-slate-500">Audit log of all withdrawn credentials</p>
            </div>
            <Badge variant="revoked">Status List Active</Badge>
          </div>

          {state.revocations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No credentials have been revoked in this registry yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Credential ID</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Revoked By</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.revocations.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-rose-700">
                        {rev.credentialId}
                      </td>
                      <td className="px-4 py-3 text-slate-800 leading-normal max-w-xs">
                        {rev.reason}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {rev.revokedByName}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                        {formatDateTime(rev.revokedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/org/credentials/${rev.credentialId}`)}
                          icon={<Eye weight="fill" className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmRevoke}
        title="Confirm Credential Revocation"
        message={`Revoke credential "${selectedCredId}" in this local demo? This updates the app's saved demo data, but does not publish a registry update.`}
        confirmText="Confirm Revocation"
        variant="danger"
      />
    </div>
  )
}
