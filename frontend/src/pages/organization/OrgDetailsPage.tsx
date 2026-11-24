import React from 'react'
import { Buildings, ShieldCheck, Calendar, Envelope, Tag } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'

export const OrgDetailsPage: React.FC = () => {
  const { state, currentUser } = useApp()

  if (!currentUser || !currentUser.organizationId) {
    return (
      <div className="p-8 text-center text-sm text-[#64748B]">
        No active organization profile found.
      </div>
    )
  }

  const org = state.organizations.find((o) => o.id === currentUser.organizationId)

  if (!org) {
    return (
      <div className="p-8 text-center text-sm text-[#64748B]">
        Organization details could not be found.
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
        <div className="flex items-center justify-between pb-6 border-b border-[#E2E8F0] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Buildings weight="fill" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">{org.name}</h1>
              <p className="text-xs text-[#64748B]">{org.orgType}</p>
            </div>
          </div>

          <Badge variant={org.status === 'active' ? 'green' : org.status === 'pending' ? 'amber' : 'red'}>
            {org.status === 'active' ? 'Approved Issuer' : org.status === 'pending' ? 'Pending Review' : 'Inactive'}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <Envelope weight="bold" className="w-3.5 h-3.5" />
                <span>Official Email</span>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">{org.email}</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <Tag weight="bold" className="w-3.5 h-3.5" />
                <span>Organization Type</span>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">{org.orgType}</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <Calendar weight="bold" className="w-3.5 h-3.5" />
                <span>Date Registered</span>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">
                {new Date(org.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <ShieldCheck weight="bold" className="w-3.5 h-3.5" />
                <span>Date Approved</span>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">
                {org.approvedAt ? new Date(org.approvedAt).toLocaleDateString() : 'Pending Approval'}
              </p>
            </div>
          </div>

          {/* Decentralized Identifier */}
          <div className="pt-4 border-t border-[#E2E8F0]">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
              Issuer Decentralized Identifier (DID)
            </h3>
            {org.did ? (
              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs break-all select-all">
                {org.did}
              </div>
            ) : (
              <p className="text-xs text-[#64748B] italic">
                A demo identifier can be assigned after administrator approval. No external DID network is connected.
              </p>
            )}
            <p className="text-[11px] text-[#64748B] mt-2">
              This identifier is used by the prototype credential records; it has not been cryptographically anchored.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
