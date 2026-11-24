import React from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  IdentificationCard,
  Clock,
  WarningCircle,
  ArrowRight,
  ShieldCheck,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/common/Badge'

export const OrgDashboard: React.FC = () => {
  const { state, currentUser } = useApp()

  if (!currentUser || !currentUser.organizationId) {
    return (
      <div className="p-8 text-center text-sm text-[#64748B]">
        No active organization profile found for this account.
      </div>
    )
  }

  const org = state.organizations.find((o) => o.id === currentUser.organizationId)

  if (!org) {
    return (
      <div className="p-8 text-center text-sm text-[#64748B]">
        Organization record not found in system state.
      </div>
    )
  }

  // PENDING APPLICATION STATE
  if (org.status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Clock weight="fill" className="w-8 h-8" />
          </div>

          <Badge variant="amber" className="mb-3">
            Application Under Review
          </Badge>

          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
            Accreditation Pending Administrator Approval
          </h1>

          <p className="text-sm text-[#334155] leading-relaxed mb-6">
            Your application for <strong>{org.name}</strong> has been received by the ShieldID accreditation registry and is currently awaiting approval from the System Administrator.
          </p>

          <div className="bg-slate-50 border border-[#E2E8F0] rounded-lg p-5 text-left text-xs space-y-3 mb-6">
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[#64748B]">Organization Name:</span>
              <span className="font-semibold text-[#0F172A]">{org.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[#64748B]">Official Email:</span>
              <span className="font-semibold text-[#0F172A]">{org.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[#64748B]">Nominated First Identity Manager:</span>
              <span className="font-semibold text-[#0F172A]">
                {org.nominatedImName || 'N/A'} ({org.nominatedImEmail || 'N/A'})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Date Submitted:</span>
              <span className="font-semibold text-[#0F172A]">
                {new Date(org.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#64748B]">
            Once approved by the System Administrator, operational credentials and decentralized DID infrastructure will be activated.
          </p>
        </div>
      </div>
    )
  }

  // REJECTED / INACTIVE STATE
  if (org.status === 'inactive') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <WarningCircle weight="fill" className="w-8 h-8" />
          </div>

          <Badge variant="red" className="mb-3">
            Application Inactive
          </Badge>

          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
            Organization Registration Rejected or Inactive
          </h1>

          <p className="text-sm text-[#334155] leading-relaxed mb-6">
            {org.rejectionReason
              ? `Rejection notice: "${org.rejectionReason}"`
              : 'This organization account is currently inactive. Contact the System Administrator for inquiries.'}
          </p>
        </div>
      </div>
    )
  }

  // APPROVED / ACTIVE DASHBOARD
  const identityManagersCount = state.users.filter(
    (u) => u.role === 'identity_manager' && u.organizationId === org.id,
  ).length

  const citizensCount = state.identities.filter(
    (i) => i.organizationId === org.id,
  ).length

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#0F172A]">{org.name}</h1>
            <Badge variant="green">Approved Issuer</Badge>
          </div>
          <p className="text-xs text-[#64748B]">
            DID: <span className="font-mono">{org.did || 'did:key:active'}</span>
          </p>
        </div>

        <Link
          to="/org/managers"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors self-start sm:self-auto"
        >
          <Users weight="bold" className="w-4 h-4" />
          <span>Manage Identity Managers</span>
        </Link>
      </div>

      {/* Exactly 2 Metric Cards as required by PRD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard
          label="Total Identity Managers"
          value={identityManagersCount}
          hint="Operational delegates provisioned for credential workflows"
          icon={<Users weight="fill" className="w-6 h-6 text-[#2563EB]" />}
        />

        <StatCard
          label="Total Citizens"
          value={citizensCount}
          hint="Citizens registered through your organization"
          icon={<IdentificationCard weight="fill" className="w-6 h-6 text-[#2563EB]" />}
        />
      </div>

      {/* Quick Navigation Panel */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
        <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">
          Institutional Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/org/details"
            className="p-4 rounded-lg border border-[#E2E8F0] hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-center justify-between group"
          >
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Organization Profile & DID</p>
              <p className="text-xs text-[#64748B] mt-0.5">Inspect institutional keys, DID string and accredited details</p>
            </div>
            <ArrowRight weight="bold" className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB]" />
          </Link>

          <Link
            to="/org/managers"
            className="p-4 rounded-lg border border-[#E2E8F0] hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-center justify-between group"
          >
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Identity Manager Roster</p>
              <p className="text-xs text-[#64748B] mt-0.5">Add, inspect, or deactivate operational staff delegates</p>
            </div>
            <ArrowRight weight="bold" className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB]" />
          </Link>
        </div>
      </div>
    </div>
  )
}
