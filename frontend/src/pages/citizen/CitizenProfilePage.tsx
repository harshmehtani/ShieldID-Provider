import React, { useState } from 'react'
import {
  IdentificationCard,
  Key,
  Copy,
  Check,
  Calendar,
  Phone,
  EnvelopeSimple,
  MapPin,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { JsonViewer } from '@/components/common/JsonViewer'
import { didDocument } from '@/lib/credential'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'

export const CitizenProfilePage: React.FC = () => {
  const { state, currentUser } = useApp()
  const [copiedDid, setCopiedDid] = useState(false)

  const myIdentity = state.identities.find(
    (i) => i.userId === currentUser?.id || i.id === currentUser?.identityId,
  )

  const copyDid = () => {
    if (!myIdentity?.did) return
    navigator.clipboard.writeText(myIdentity.did)
    setCopiedDid(true)
    setTimeout(() => setCopiedDid(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          My Decentralized Identity & Profile
        </h1>
        <p className="text-sm text-slate-500">
          Profile details and the sample identifier associated with your demo account
        </p>
      </div>

      <PrototypeNotice text="This demo shows a locally generated identifier and example DID document. It is not anchored to an external network." />

      {/* Identity Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
              {currentUser?.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{currentUser?.name}</h2>
                <Badge variant={myIdentity?.status || 'active'}>
                  {(myIdentity?.status || 'ACTIVE').toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Registry ID: {myIdentity?.id || 'idn_aarav'} | Ref: {myIdentity?.idReference || 'HCR-20481'}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block mb-0.5 font-medium uppercase text-[10px]">
              Email Address
            </span>
            <span className="font-semibold text-slate-900">{currentUser?.email}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block mb-0.5 font-medium uppercase text-[10px]">
              Phone Number
            </span>
            <span className="font-semibold text-slate-900">{myIdentity?.phone || '+91 98200 11021'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block mb-0.5 font-medium uppercase text-[10px]">
              Date of Birth
            </span>
            <span className="font-semibold text-slate-900">{myIdentity?.dateOfBirth || '1996-04-12'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block mb-0.5 font-medium uppercase text-[10px]">
              Residential Address
            </span>
            <span className="font-semibold text-slate-900 leading-tight block">
              {myIdentity?.address || '42 Palm Court, Bandra, Mumbai 400050'}
            </span>
          </div>
        </div>

        {/* DID Section */}
        {myIdentity?.did && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Subject Decentralized Identifier (DID)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Unique identifier used in all verifiable credentials issued to you
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyDid}
                icon={copiedDid ? <Check weight="bold" className="w-3.5 h-3.5 text-emerald-600" /> : <Copy weight="fill" className="w-3.5 h-3.5 text-blue-600" />}
              >
                {copiedDid ? 'Copied' : 'Copy DID'}
              </Button>
            </div>

            <code className="bg-slate-100 p-2.5 rounded-md font-mono text-xs text-slate-800 block break-all border border-slate-200">
              {myIdentity.did}
            </code>

            {/* W3C DID Document */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                Resolved W3C DID Document
              </span>
              <JsonViewer
                data={didDocument(myIdentity.did)}
                title={`${myIdentity.did}.json`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
