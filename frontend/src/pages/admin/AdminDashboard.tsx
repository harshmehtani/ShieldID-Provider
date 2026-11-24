import React from 'react'
import { Link } from 'react-router-dom'
import {
  Buildings,
  FolderUser,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { StatCard } from '@/components/common/StatCard'

export const AdminDashboard: React.FC = () => {
  const { state } = useApp()

  const totalOrgs = state.organizations.length
  const pendingOrgs = state.organizations.filter((o) => o.status === 'pending').length
  const approvedOrgs = state.organizations.filter((o) => o.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">System Administration</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            ShieldID Root Accreditation & Issuer Governance Authority
          </p>
        </div>

        {pendingOrgs > 0 && (
          <Link
            to="/admin/requests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md transition-colors self-start sm:self-auto"
          >
            <FolderUser weight="bold" className="w-4 h-4" />
            <span>Review Pending Applications ({pendingOrgs})</span>
          </Link>
        )}
      </div>

      {/* Exactly 3 Metric Cards per PRD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Total Organizations"
          value={totalOrgs}
          hint="All registered institutional entities"
          icon={<Buildings weight="fill" className="w-6 h-6 text-[#2563EB]" />}
        />

        <StatCard
          label="Pending Applications"
          value={pendingOrgs}
          hint="Institutions awaiting accreditation review"
          icon={<Clock weight="fill" className="w-6 h-6 text-amber-600" />}
        />

        <StatCard
          label="Approved Organizations"
          value={approvedOrgs}
          hint="Accredited issuers with active DID anchors"
          icon={<CheckCircle weight="fill" className="w-6 h-6 text-emerald-600" />}
        />
      </div>

      {/* Navigation / Activity Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/requests"
          className="p-5 bg-white border border-[#E2E8F0] hover:border-blue-400 hover:shadow-xs rounded-xl transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <FolderUser weight="fill" className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Organization Requests</h3>
            <p className="text-xs text-[#64748B] mt-1">
              Review institutional accreditation applications and provision delegated manager accounts.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs text-[#2563EB] font-semibold group-hover:underline">
            <span>Inspect Queue ({pendingOrgs})</span>
            <ArrowRight weight="bold" className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/organizations"
          className="p-5 bg-white border border-[#E2E8F0] hover:border-blue-400 hover:shadow-xs rounded-xl transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3">
              <Buildings weight="fill" className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Approved Organizations</h3>
            <p className="text-xs text-[#64748B] mt-1">
              Browse accredited institutions, active DIDs, and institutional metrics.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs text-[#2563EB] font-semibold group-hover:underline">
            <span>Browse Directory ({approvedOrgs})</span>
            <ArrowRight weight="bold" className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/audit"
          className="p-5 bg-white border border-[#E2E8F0] hover:border-blue-400 hover:shadow-xs rounded-xl transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
              <Clock weight="fill" className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">System Audit Logs</h3>
            <p className="text-xs text-[#64748B] mt-1">
              Immutable chronological record of onboarding, issuance, and revocation events.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs text-[#2563EB] font-semibold group-hover:underline">
            <span>Inspect Logs</span>
            <ArrowRight weight="bold" className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  )
}
