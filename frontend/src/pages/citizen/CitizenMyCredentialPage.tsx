import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Certificate,
  ArrowLeft,
  DownloadSimple,
  User,
  Buildings,
  ShieldCheck,
  Copy,
  Check,
  Calendar,
  Lock,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { JsonViewer } from '@/components/common/JsonViewer'
import { buildCredentialJson } from '@/lib/credential'
import { formatOptionalDate } from '@/lib/dates'
import { registryStatus } from '@/lib/credential'

export const CitizenMyCredentialPage: React.FC = () => {
  const { state, currentUser } = useApp()
  const [copiedDid, setCopiedDid] = useState(false)

  if (!currentUser) return null

  const identity = state.identities.find(
    (i) => i.id === currentUser.identityId || i.userId === currentUser.id,
  )

  const credential = identity
    ? state.credentials.find((c) => c.identityId === identity.id)
    : null

  if (!credential) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Certificate weight="fill" className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#0F172A] mb-1">
            No Verifiable Credential Available
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            You do not currently have an active verifiable credential.
          </p>
          <Link
            to="/citizen/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-md hover:bg-[#1D4ED8]"
          >
            <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    )
  }

  const handleDownload = () => {
    const credJson = buildCredentialJson(credential)
    const blob = new Blob([JSON.stringify(credJson, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my-credential-${credential.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const credentialStatus = registryStatus(credential)

  const handleCopyDid = () => {
    if (identity?.did) {
      navigator.clipboard.writeText(identity.did)
      setCopiedDid(true)
      setTimeout(() => setCopiedDid(false), 3000)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/citizen/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
        >
          <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Single primary action per PRD */}
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
        >
          <DownloadSimple weight="bold" className="w-4 h-4" />
          <span>Download Credential (JSON)</span>
        </button>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs space-y-8">
        {/* Section 1: Credential Information */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <Certificate weight="fill" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0F172A]">{credential.title}</h1>
                <p className="text-xs text-[#64748B]">{credential.type}</p>
              </div>
            </div>

            <Badge variant={credentialStatus}>
              {credentialStatus === 'issued' ? 'Active' : credentialStatus === 'expired' ? 'Expired' : 'Revoked'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-[#64748B] block mb-0.5">Credential ID:</span>
              <span className="font-mono font-semibold text-[#0F172A] break-all">{credential.id}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-[#64748B] block mb-0.5">Issue Timestamp:</span>
              <span className="font-semibold text-[#0F172A]">
                {new Date(credential.issuedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-[#64748B] block mb-0.5">Expiry Timestamp:</span>
              <span className="font-semibold text-[#0F172A]">
                {formatOptionalDate(credential.expiresAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Information & DID */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            <User weight="fill" className="w-4 h-4 text-[#2563EB]" />
            <span>Subject & Identity Holder</span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[#64748B] block mb-0.5">Full Legal Name:</span>
                <span className="font-semibold text-[#0F172A]">{identity?.fullName}</span>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Email Address:</span>
                <span className="font-semibold text-[#0F172A]">{identity?.email}</span>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Date of Birth:</span>
                <span className="font-semibold text-[#0F172A]">{identity?.dateOfBirth}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60">
              <span className="text-[#64748B] block mb-1">Subject Decentralized Identifier (DID):</span>
              <div className="flex items-center justify-between gap-3 p-2 bg-white border border-slate-200 rounded">
                <span className="font-mono text-[11px] text-[#0F172A] break-all select-all">
                  {identity?.did}
                </span>
                <button
                  type="button"
                  onClick={handleCopyDid}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 rounded shrink-0"
                >
                  {copiedDid ? <Check weight="bold" className="w-3.5 h-3.5 text-emerald-600" /> : <Copy weight="bold" className="w-3.5 h-3.5" />}
                  <span>{copiedDid ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Issuer Information */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            <Buildings weight="fill" className="w-4 h-4 text-[#2563EB]" />
            <span>Issuing Institutional Authority</span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div>
              <span className="text-[#64748B] block mb-0.5">Organization:</span>
              <span className="font-bold text-sm text-[#0F172A]">{credential.issuerName}</span>
            </div>
            <div>
              <span className="text-[#64748B] block mb-0.5">Issuer Decentralized Identifier (DID):</span>
              <p className="font-mono text-[11px] text-slate-700 break-all select-all bg-white p-2 border border-slate-200 rounded">
                {credential.issuerDid}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Attested Claims Data */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Attested Claims Data
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg divide-y divide-slate-200/70 text-xs">
            {Object.entries(credential.claims).map(([k, v]) => (
              <div key={k} className="px-4 py-3 flex justify-between">
                <span className="font-medium text-[#64748B] capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-semibold text-[#0F172A]">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Cryptographic Proof */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            <Lock weight="fill" className="w-4 h-4 text-[#2563EB]" />
            <span>Cryptographic Proof Data</span>
          </div>

          <JsonViewer data={credential.proof} />
        </div>
      </div>
    </div>
  )
}
