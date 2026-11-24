import React from 'react'
import { Link } from 'react-router-dom'
import {
  Certificate,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Buildings,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { registryStatus } from '@/lib/credential'

export const CitizenDashboard: React.FC = () => {
  const { state, currentUser } = useApp()

  if (!currentUser) return null

  // Find citizen identity and their single credential
  const identity = state.identities.find(
    (i) => i.id === currentUser.identityId || i.userId === currentUser.id,
  )

  const credential = identity
    ? state.credentials.find((c) => c.identityId === identity.id)
    : null
  const credentialStatus = credential ? registryStatus(credential) : null

  return (
    <div className="max-w-3xl space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Decentralized Citizen Credential Vault
          </p>
        </div>

        {credential && (
          <Link
            to="/citizen/credential"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors self-start sm:self-auto"
          >
            <span>View My Credential</span>
            <ArrowRight weight="bold" className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Single Credential Overview Card or Empty State */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
        <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
          My Digital Credential
        </h2>

        {credential ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                  <Certificate weight="fill" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">{credential.title}</h3>
                  <p className="text-xs text-[#64748B]">{credential.type}</p>
                </div>
              </div>

              <Badge variant={credentialStatus ?? 'neutral'}>
                {credentialStatus === 'issued' ? 'Active' : credentialStatus === 'expired' ? 'Expired' : 'Revoked'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Buildings weight="fill" className="w-4 h-4 text-[#2563EB]" />
                <span>Issuer: <strong>{credential.issuerName}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar weight="fill" className="w-4 h-4 text-[#2563EB]" />
                <span>Issued: {new Date(credential.issuedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/60 flex justify-end">
              <Link
                to="/citizen/credential"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors"
              >
                <span>Inspect Full Credential & Download</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Certificate weight="fill" className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#0F172A] mb-1">
              No Credential Issued Yet
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Your local demo identity record is ready, but your organization has not yet issued a credential.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
