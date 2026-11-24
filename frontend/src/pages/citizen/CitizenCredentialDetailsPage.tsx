import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Certificate,
  ShareNetwork,
  ShieldCheck,
  ArrowLeft,
  Key,
  Buildings,
  Calendar,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { JsonViewer } from '@/components/common/JsonViewer'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'
import { formatDate, formatOptionalDate } from '@/lib/dates'
import { buildCredentialJson, registryStatus } from '@/lib/credential'

export const CitizenCredentialDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { state } = useApp()
  const navigate = useNavigate()

  const credential = state.credentials.find((c) => c.id === id)

  if (!credential) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-800">Credential Not Found</h2>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/citizen/credentials')}>
          Back to My Credentials
        </Button>
      </div>
    )
  }

  const regStat = registryStatus(credential)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/citizen/credentials')}
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
            variant="primary"
            size="sm"
            onClick={() => navigate('/citizen/presentations')}
            icon={<ShareNetwork weight="fill" className="w-4 h-4" />}
          >
            Share with Selective Disclosure
          </Button>
        </div>
      </div>

      <PrototypeNotice text="This is a locally stored demo credential with simulated proof data. Its signature has not been verified." />

      {/* Visual Identity Card Presentation */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-blue-400">
              ShieldID Verifiable Credential
            </span>
            <h2 className="text-xl font-bold tracking-tight mt-1">{credential.type}</h2>
          </div>
          <Badge variant={regStat}>{regStat.toUpperCase()}</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-slate-700/60">
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Holder Subject</span>
            <span className="font-semibold text-slate-100 block mt-0.5">{credential.subjectName}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Issuer</span>
            <span className="font-semibold text-slate-100 block mt-0.5">{credential.issuerName}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Issuance Date</span>
            <span className="font-semibold text-slate-100 block mt-0.5 font-mono">{formatDate(credential.issuedAt)}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Expiration</span>
            <span className="font-semibold text-slate-100 block mt-0.5 font-mono">{formatOptionalDate(credential.expiresAt)}</span>
          </div>
        </div>
      </div>

      {/* Asserted Claims Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Verified Subject Claims
          </h3>
          <p className="text-xs text-slate-500">Attributes asserted by {credential.issuerName}</p>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 w-1/3">Claim Attribute</th>
              <th className="px-6 py-3">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.entries(credential.claims).map(([k, v]) => (
              <tr key={k} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-6 py-3 font-semibold text-slate-700 capitalize">
                  {k.replace(/([A-Z])/g, ' $1')}
                </td>
                <td className="px-6 py-3 text-slate-900 font-medium">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Proof & W3C JSON */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Cryptographic Proof & W3C JSON-LD
        </h3>
        <JsonViewer
          data={buildCredentialJson(credential)}
          title={`credential_${credential.id}.json`}
          filename={`${credential.id}.json`}
        />
      </div>
    </div>
  )
}
