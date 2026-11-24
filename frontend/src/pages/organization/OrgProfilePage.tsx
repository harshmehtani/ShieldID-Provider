import React from 'react'
import {
  Buildings,
  Globe,
  EnvelopeSimple,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  ShieldCheck,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { JsonViewer } from '@/components/common/JsonViewer'
import { formatDate } from '@/lib/dates'
import { didDocument } from '@/lib/credential'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'

export const OrgProfilePage: React.FC = () => {
  const { state, currentUser } = useApp()

  const org = state.organizations.find((o) => o.id === currentUser?.organizationId) || state.organizations[0]
  const orgCreds = state.credentials.filter((c) => c.organizationId === org?.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Organization Profile & Authority
        </h1>
        <p className="text-sm text-slate-500">
          Institutional identity details, issuer DID registration, and public verification keys
        </p>
      </div>

      <PrototypeNotice text="This profile shows the organization identifier used by local demo data. It is not resolved through did:web." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Org Summary Card */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 p-6 space-y-5 shadow-2xs">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Buildings weight="fill" className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{org?.name}</h2>
            <p className="text-xs text-slate-500">{org?.legalName}</p>
            <div className="mt-2.5">
              <Badge variant={org?.status}>{org?.status.toUpperCase()}</Badge>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Globe weight="fill" className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{org?.website}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <EnvelopeSimple weight="fill" className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{org?.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone weight="fill" className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{org?.phone}</span>
            </div>
            <div className="flex items-start gap-2.5 text-slate-600">
              <MapPin weight="fill" className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="leading-tight">{org?.address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Calendar weight="fill" className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Registered {formatDate(org?.createdAt || '')}</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Organization Issuer DID
            </span>
            <code className="text-[11px] font-mono text-slate-800 bg-slate-100 p-2 rounded-md block break-all border border-slate-200">
              {org?.did}
            </code>
          </div>
        </div>

        {/* Right: Mission & W3C DID Document */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Issuer Authority & Scope
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{org?.description}</p>
            <div className="pt-2 flex items-center gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex-1">
                <span className="text-slate-400 block text-[11px]">Total Issued Records</span>
                <span className="text-lg font-bold text-slate-900">{orgCreds.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex-1">
                <span className="text-slate-400 block text-[11px]">Signing Key Suite</span>
                <span className="text-xs font-mono font-bold text-slate-800">Ed25519VerificationKey2020</span>
              </div>
            </div>
          </div>

          {/* W3C DID Document */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Public DID Document (did:web)
                </h3>
                <p className="text-xs text-slate-500">
                  Published at https://{org?.website}/.well-known/did.json
                </p>
              </div>
              <Badge variant="active">Resolvable</Badge>
            </div>

            <JsonViewer
              data={didDocument(org?.did || 'did:web:harbor.registry.example')}
              title="did.json"
              filename="did.json"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
