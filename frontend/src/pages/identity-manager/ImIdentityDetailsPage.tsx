import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  IdentificationCard,
  Key,
  Certificate,
  ArrowLeft,
  CheckCircle,
  XCircle,
  PlusCircle,
  Eye,
  Copy,
  Check,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { JsonViewer } from '@/components/common/JsonViewer'
import { Textarea } from '@/components/common/Textarea'
import { formatDate, formatOptionalDate } from '@/lib/dates'
import { didDocument, registryStatus } from '@/lib/credential'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'

export const ImIdentityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { state, currentUser, reviewIdentity } = useApp()
  const navigate = useNavigate()

  const [copiedDid, setCopiedDid] = useState(false)
  const [reviewNote, setReviewNote] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  const identity = state.identities.find((i) => i.id === id && i.organizationId === currentUser?.organizationId)
  const associatedCredentials = state.credentials.filter((c) => c.identityId === id)

  if (!identity) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-800">Identity Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          No identity matches identifier "{id}".
        </p>
        <Button variant="secondary" onClick={() => navigate('/im/identities')}>
          Back to Directory
        </Button>
      </div>
    )
  }

  const handleReview = (status: 'active' | 'rejected') => {
    setReviewLoading(true)
    setTimeout(() => {
      reviewIdentity(identity.id, status, reviewNote)
      setReviewLoading(false)
    }, 300)
  }

  const copyDid = () => {
    if (!identity.did) return
    navigator.clipboard.writeText(identity.did)
    setCopiedDid(true)
    setTimeout(() => setCopiedDid(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/im/identities')}
            icon={<ArrowLeft weight="bold" className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {identity.fullName}
              </h1>
              <Badge variant={identity.status}>
                {identity.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs font-mono text-slate-500">ID: {identity.id} | Ref: {identity.idReference}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {identity.status === 'active' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/im/issue')}
              icon={<PlusCircle weight="fill" className="w-4 h-4" />}
            >
              Issue Credential to Citizen
            </Button>
          )}
        </div>
      </div>

      <PrototypeNotice text="This demo displays a locally generated identifier and example DID document. It is not anchored to or resolved by an external DID network." />

      {/* Review Queue Panel if Pending */}
      {identity.status === 'pending_review' && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-900">
            <IdentificationCard weight="fill" className="w-5 h-5 text-amber-700" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Identity Verification & Review Workflow
            </h3>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            This citizen submitted a registration request. Review the local demo record and approve or reject it.
          </p>

          <Textarea
            label="Review Decision Notes (Optional)"
            placeholder="Add verification notes or reason for approval / rejection..."
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            rows={2}
          />

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              variant="destructive"
              size="sm"
              loading={reviewLoading}
              onClick={() => handleReview('rejected')}
              icon={<XCircle weight="fill" className="w-4 h-4" />}
            >
              Reject Registration
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={reviewLoading}
              onClick={() => handleReview('active')}
              icon={<CheckCircle weight="fill" className="w-4 h-4" />}
            >
              Approve & Generate DID
            </Button>
          </div>
        </div>
      )}

      {/* Citizen Personal Attributes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[11px] block uppercase font-medium">Email Address</span>
          <span className="text-sm font-semibold text-slate-900 block mt-0.5">{identity.email}</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[11px] block uppercase font-medium">Phone Number</span>
          <span className="text-sm font-semibold text-slate-900 block mt-0.5">{identity.phone}</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[11px] block uppercase font-medium">Date of Birth</span>
          <span className="text-sm font-semibold text-slate-900 block mt-0.5">{identity.dateOfBirth}</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[11px] block uppercase font-medium">Residential Address</span>
          <span className="text-xs font-semibold text-slate-900 block mt-0.5 leading-tight">{identity.address}</span>
        </div>
      </div>

      {/* DID & DID Document */}
      {identity.did && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                W3C Decentralized Identifier
              </h3>
              <p className="text-xs text-slate-500">Cryptographically resolvable identity string</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyDid}
              icon={copiedDid ? <Check weight="bold" className="w-3.5 h-3.5 text-emerald-600" /> : <Copy weight="fill" className="w-3.5 h-3.5" />}
            >
              {copiedDid ? 'Copied' : 'Copy DID'}
            </Button>
          </div>

          <code className="bg-slate-100 p-2.5 rounded-md font-mono text-xs text-slate-800 block break-all border border-slate-200">
            {identity.did}
          </code>

          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
              DID Document Resolution
            </span>
            <JsonViewer
              data={didDocument(identity.did)}
              title={`${identity.did}.json`}
            />
          </div>
        </div>
      )}

      {/* Associated Issued Credentials */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Credentials Held by Citizen ({associatedCredentials.length})
            </h3>
            <p className="text-xs text-slate-500">Verifiable credentials linked to this subject DID</p>
          </div>
          {identity.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/im/issue')}
              icon={<PlusCircle weight="fill" className="w-3.5 h-3.5" />}
            >
              Issue Credential
            </Button>
          )}
        </div>

        {associatedCredentials.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No credentials have been issued to this citizen yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Credential ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Issued Date</th>
                  <th className="px-4 py-3">Expiration Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {associatedCredentials.map((cred) => {
                  const regStat = registryStatus(cred)
                  return (
                    <tr key={cred.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-900">
                        {cred.id}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {cred.type}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono">
                        {formatDate(cred.issuedAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono">
                        {formatOptionalDate(cred.expiresAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={regStat}>{regStat.toUpperCase()}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/org/credentials/${cred.id}`)}
                          icon={<Eye weight="fill" className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
