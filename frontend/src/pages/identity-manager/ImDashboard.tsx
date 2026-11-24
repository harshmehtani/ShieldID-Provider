import React from 'react'
import { Link } from 'react-router-dom'
import {
  IdentificationCard,
  Certificate,
  UserPlus,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/common/Badge'
import { registryStatus } from '@/lib/credential'

export const ImDashboard: React.FC = () => {
  const { state, currentUser } = useApp()

  if (!currentUser || !currentUser.organizationId) {
    return (
      <div className="p-8 text-center text-sm text-[#64748B]">
        Account is not affiliated with an active issuing organization.
      </div>
    )
  }

  const org = state.organizations.find((o) => o.id === currentUser.organizationId)
  const orgIdentities = state.identities.filter((i) => i.organizationId === currentUser.organizationId)
  const orgCredentials = state.credentials.filter((c) => c.organizationId === currentUser.organizationId)
  const issuedCredentials = orgCredentials.filter((c) => c.issuedByUserId === currentUser.id)

  const recentCredentials = [...issuedCredentials]
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
    .slice(0, 5)
  const recentActivity = state.audits
    .filter((event) => event.userId === currentUser.id && ['REGISTER_CITIZEN', 'ISSUE_CREDENTIAL'].includes(event.action))
    .slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#0F172A]">
              Welcome back, {currentUser.name}
            </h1>
            <Badge variant="blue">Identity Manager</Badge>
          </div>
          <p className="text-xs text-[#64748B]">
            Issuing on behalf of: <strong className="text-[#0F172A]">{org?.name || 'Authorized Institution'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/im/citizens/register"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors"
          >
            <UserPlus weight="bold" className="w-4 h-4" />
            <span>Register Citizen</span>
          </Link>
          <Link
            to="/im/issue"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors"
          >
            <PlusCircle weight="bold" className="w-4 h-4" />
            <span>Issue Credential</span>
          </Link>
        </div>
      </div>

      {/* 2 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard
          label="Registered Citizens"
          value={orgIdentities.filter((identity) => identity.createdByUserId === currentUser.id).length}
          hint="Decentralized identifiers generated under this organization"
          icon={<IdentificationCard weight="fill" className="w-6 h-6 text-[#2563EB]" />}
        />

        <StatCard
          label="Credentials Issued"
          value={issuedCredentials.length}
          hint="Credentials successfully issued by you"
          icon={<Certificate weight="fill" className="w-6 h-6 text-[#2563EB]" />}
        />
      </div>

      <section className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E2E8F0]">
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Recent Activity</h2>
        </div>
        {recentActivity.length === 0 ? (
          <p className="p-6 text-xs text-[#64748B]">Citizen registrations and credential issuances will appear here.</p>
        ) : (
          <ul className="divide-y divide-[#E2E8F0]">
            {recentActivity.map((event) => (
              <li key={event.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    {event.action === 'REGISTER_CITIZEN' ? 'Registered a citizen' : 'Issued a credential'}
                  </p>
                  <p className="text-xs text-[#64748B]">{event.resource} · {event.resourceId}</p>
                </div>
                <time className="shrink-0 text-xs text-[#64748B]" dateTime={event.timestamp}>
                  {new Date(event.timestamp).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent Credentials Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
            Recent Credential Issuances
          </h2>
          <Link
            to="/im/credentials"
            className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight weight="bold" className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentCredentials.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B]">
            No verifiable credentials issued yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Subject (Citizen)</th>
                  <th className="px-6 py-3.5">Credential Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Issued At</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentCredentials.map((c) => {
                  const status = registryStatus(c)
                  return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-[#0F172A]">
                      {c.subjectName}
                    </td>
                    <td className="px-6 py-3.5 text-[#334155]">{c.title}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant={status}>
                        {status === 'issued' ? 'Active' : status === 'expired' ? 'Expired' : 'Revoked'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-[#64748B]">
                      {new Date(c.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        to={`/im/credentials/${c.id}`}
                        className="text-[#2563EB] hover:underline font-semibold"
                      >
                        Inspect
                      </Link>
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
