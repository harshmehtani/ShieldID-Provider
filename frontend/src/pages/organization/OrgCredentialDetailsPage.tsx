import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Certificate,
  ShieldCheck,
  Warning,
  ArrowLeft,
  Key,
  Calendar,
  User,
  Buildings,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { JsonViewer } from '@/components/common/JsonViewer'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'
import { formatDate, formatDateTime, formatOptionalDate } from '@/lib/dates'
import { buildCredentialJson, registryStatus } from '@/lib/credential'

export const OrgCredentialDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { state, revokeCredential } = useApp()
  const navigate = useNavigate()

  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false)
  const [revokeReason, setRevokeReason] = useState('')

  const credential = state.credentials.find((c) => c.id === id)

  if (!credential) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-800">Credential Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The credential with ID "{id}" could not be located in registry records.
        </p>
        <Button variant="secondary" onClick={() => navigate('/org/credentials')}>
          Back to Issued Credentials
        </Button>
      </div>
    )
  }

  const regStat = registryStatus(credential)
  const isRevoked = credential.status === 'revoked'
  const revocationRecord = state.revocations.find((r) => r.credentialId === credential.id)

  const handleRevoke = () => {
    revokeCredential(credential.id, revokeReason || 'Administrative revocation by issuing authority.')
    setConfirmRevokeOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/org/credentials')}
            icon={<ArrowLeft weight="bold" className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {credential.title || credential.type}
              </h1>
              <Badge variant={regStat}>{regStat.toUpperCase()}</Badge>
            </div>
            <p className="text-xs font-mono text-slate-500">ID: {credential.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/verify')}
            icon={<ShieldCheck weight="fill" className="w-4 h-4 text-blue-600" />}
          >
            Verify Credential
          </Button>

          {!isRevoked && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmRevokeOpen(true)}
              icon={<Warning weight="fill" className="w-4 h-4" />}
            >
              Revoke Credential
            </Button>
          )}
        </div>
      </div>

      <PrototypeNotice text="This screen displays a demo credential record and simulated proof fields. No cryptographic signature is created or validated." />

      {/* Revocation Banner if Revoked */}
      {isRevoked && revocationRecord && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <Warning weight="fill" className="w-4 h-4 text-rose-600" />
            <span>Revocation Record Active</span>
          </div>
          <p className="leading-relaxed font-medium">
            Reason: <span className="text-slate-800">{revocationRecord.reason}</span>
          </p>
          <div className="text-[11px] text-slate-500 flex gap-4 pt-1">
            <span>Revoked By: {revocationRecord.revokedByName}</span>
            <span className="font-mono">Revoked At: {formatDateTime(revocationRecord.revokedAt)}</span>
          </div>
        </div>
      )}

      {/* Metadata Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <User weight="fill" className="w-4 h-4 text-blue-600" />
            <span>Subject (Holder)</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{credential.subjectName}</p>
          <p className="text-[11px] font-mono text-slate-400 truncate mt-1">{credential.subjectDid}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Buildings weight="fill" className="w-4 h-4 text-blue-600" />
            <span>Issuer Organization</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{credential.issuerName}</p>
          <p className="text-[11px] font-mono text-slate-400 truncate mt-1">{credential.issuerDid}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Calendar weight="fill" className="w-4 h-4 text-blue-600" />
            <span>Issuance Date</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{formatDate(credential.issuedAt)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Issued by {credential.issuedByName}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Calendar weight="fill" className="w-4 h-4 text-blue-600" />
            <span>Expiration Date</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{formatOptionalDate(credential.expiresAt)}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Status: <span className="capitalize">{regStat}</span>
          </p>
        </div>
      </div>

      {/* Claims Breakdown Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Credential Claims (Subject Attributes)
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {Object.keys(credential.claims).length} Assertions
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 w-1/3">Claim Attribute</th>
              <th className="px-6 py-3">Asserted Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.entries(credential.claims).map(([key, value]) => (
              <tr key={key} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-6 py-3 font-semibold text-slate-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </td>
                <td className="px-6 py-3 text-slate-900 font-medium">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cryptographic Proof Details */}
      {credential.proof && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Key weight="fill" className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Cryptographic Proof Block
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block mb-0.5">Signature Suite:</span>
              <span className="font-mono font-medium text-slate-800">{credential.proof.type}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Verification Method:</span>
              <span className="font-mono font-medium text-slate-800">{credential.proof.verificationMethod}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Proof Purpose:</span>
              <span className="font-mono font-medium text-slate-800">{credential.proof.proofPurpose}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Created Timestamp:</span>
              <span className="font-mono font-medium text-slate-800">{credential.proof.created}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block mb-0.5">Proof Value (Multibase / Signature):</span>
              <code className="bg-white p-2 rounded-md border border-slate-200 font-mono text-slate-800 block break-all text-[11px]">
                {credential.proof.proofValue}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* JSON Viewer */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          W3C JSON-LD Representation
        </h3>
        <JsonViewer
          data={buildCredentialJson(credential)}
          title={`urn:shieldid:demo:${credential.id}`}
          filename={`${credential.id}.json`}
        />
      </div>

      {/* Revocation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmRevokeOpen}
        onClose={() => setConfirmRevokeOpen(false)}
        onConfirm={handleRevoke}
        title="Revoke Verifiable Credential"
        message={`Are you sure you want to revoke credential ${credential.id}? This will immediately update the public registry and flag the credential as revoked.`}
        confirmText="Revoke Credential"
        variant="danger"
      />
    </div>
  )
}
