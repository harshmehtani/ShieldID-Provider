import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  IdentificationCard,
  ArrowLeft,
  Calendar,
  Envelope,
  Code,
  Certificate,
  PlusCircle,
  Copy,
  Check,
  ShieldCheck,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { JsonViewer } from '@/components/common/JsonViewer'
import { didDocument, registryStatus } from '@/lib/credential'
import { formatOptionalDate } from '@/lib/dates'

export const ImCitizenDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { state, currentUser } = useApp()

  const [showDidDocModal, setShowDidDocModal] = useState(false)
  const [copiedDid, setCopiedDid] = useState(false)

  if (!currentUser || !currentUser.organizationId) {
    return null
  }

  const identity = state.identities.find(
    (i) => i.id === id && i.organizationId === currentUser.organizationId,
  )

  if (!identity) {
    return (
      <div className="p-8 text-center text-sm text-[#64748B]">
        <p className="mb-4">Citizen record not found.</p>
        <Link to="/im/citizens" className="text-[#2563EB] hover:underline font-semibold">
          Return to Citizens
        </Link>
      </div>
    )
  }

  // Look up credential issued to this citizen
  const credential = state.credentials.find((c) => c.identityId === identity.id)

  const handleCopyDid = () => {
    if (identity.did) {
      navigator.clipboard.writeText(identity.did)
      setCopiedDid(true)
      setTimeout(() => setCopiedDid(false), 3000)
    }
  }

  const generatedDidDoc = identity.did ? didDocument(identity.did) : null

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/im/citizens"
        className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
      >
        <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
        <span>Back to Citizens List</span>
      </Link>

      {/* Citizen Personal Info */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-base">
              {identity.fullName.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">{identity.fullName}</h1>
              <p className="text-xs text-[#64748B]">Citizen Identity Subject</p>
            </div>
          </div>

          <Badge variant={identity.status === 'active' ? 'green' : 'red'}>
            {identity.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
              <Envelope weight="bold" className="w-3.5 h-3.5" />
              <span>Email Address</span>
            </div>
            <p className="text-sm font-semibold text-[#0F172A]">{identity.email}</p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
              <Calendar weight="bold" className="w-3.5 h-3.5" />
              <span>Date of Birth</span>
            </div>
            <p className="text-sm font-semibold text-[#0F172A]">{identity.dateOfBirth}</p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
              <Calendar weight="bold" className="w-3.5 h-3.5" />
              <span>Registration Date</span>
            </div>
            <p className="text-sm font-semibold text-[#0F172A]">
              {new Date(identity.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Decentralized Identifier Section */}
        <div className="pt-4 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Decentralized Identifier (DID)
            </h3>
            <button
              type="button"
              onClick={() => setShowDidDocModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-[#2563EB] hover:underline font-semibold"
            >
              <Code weight="bold" className="w-3.5 h-3.5" />
              <span>View DID Document</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-[#0F172A] break-all select-all">
              {identity.did || 'did:key:not_generated'}
            </span>
            <button
              type="button"
              onClick={handleCopyDid}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 shrink-0"
            >
              {copiedDid ? <Check weight="bold" className="w-3 h-3 text-emerald-600" /> : <Copy weight="bold" className="w-3 h-3" />}
              <span>{copiedDid ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Credential Status Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
        <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <span>Verifiable Credential Record</span>
          <span className="text-[11px] font-normal text-[#64748B] normal-case">
            System Policy: Exactly 1 credential per citizen
          </span>
        </h2>

        {credential ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-[#0F172A]">{credential.title}</p>
                <p className="text-xs text-[#64748B]">Issued: {new Date(credential.issuedAt).toLocaleDateString()}</p>
              </div>
              <Badge variant={registryStatus(credential)}>
                {registryStatus(credential) === 'issued' ? 'Active' : registryStatus(credential) === 'expired' ? 'Expired' : 'Revoked'}
              </Badge>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-xs text-[#64748B]">
                Expires: {formatOptionalDate(credential.expiresAt)}
              </span>
              <Link
                to={`/im/credentials/${credential.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors"
              >
                <Certificate weight="bold" className="w-3.5 h-3.5" />
                <span>Inspect Credential Details</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg">
            <Certificate weight="fill" className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#0F172A] mb-1">
              No Credential Issued
            </p>
            <p className="text-xs text-[#64748B] mb-4">
              This citizen has not yet received their single authorized credential.
            </p>
            <Link
              to={`/im/credentials/issue?citizenId=${identity.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
            >
              <PlusCircle weight="bold" className="w-4 h-4" />
              <span>Issue Credential to Citizen</span>
            </Link>
          </div>
        )}
      </div>

      {/* DID Document Modal */}
      <Modal
        open={showDidDocModal}
        onClose={() => setShowDidDocModal(false)}
        title="Decentralized Identifier (DID) Document"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#334155]">
            W3C DID Document resolving public verification methods and assertion capabilities for subject <strong>{identity.fullName}</strong>.
          </p>
          <JsonViewer data={generatedDidDoc} />
        </div>
      </Modal>
    </div>
  )
}
