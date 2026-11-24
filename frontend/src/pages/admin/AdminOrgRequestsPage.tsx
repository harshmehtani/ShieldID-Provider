import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Buildings, Calendar, CheckCircle, EnvelopeSimple, User } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'

export const AdminOrgRequestsPage: React.FC = () => {
  const { state, approveOrganization } = useApp()
  const pendingRequests = state.organizations.filter((organization) => organization.status === 'pending')

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-[#0F172A]">Organization Accreditation Requests</h1>
        <p className="text-xs text-[#64748B]">Review pending institutional issuer registration applications</p>
      </header>

      {pendingRequests.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle weight="fill" className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-semibold text-[#0F172A] mb-1">No Pending Applications</h2>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">All organization registration requests have been reviewed and processed.</p>
        </div>
      ) : (
        <section className="space-y-3" aria-label="Pending organization applications">
          {pendingRequests.map((organization) => (
            <article key={organization.id} className="rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Buildings weight="fill" className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[#0F172A] break-words">{organization.name}</h2>
                    <p className="text-xs text-[#64748B] mt-0.5">{organization.orgType}</p>
                  </div>
                </div>
                <Badge variant="amber">Pending review</Badge>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                <div className="min-w-0 rounded-md bg-slate-50 p-3">
                  <dt className="flex items-center gap-1.5 text-slate-500"><EnvelopeSimple weight="bold" className="w-3.5 h-3.5" /> Official email</dt>
                  <dd className="mt-1 font-medium text-slate-800 break-all">{organization.email}</dd>
                </div>
                <div className="min-w-0 rounded-md bg-slate-50 p-3">
                  <dt className="flex items-center gap-1.5 text-slate-500"><User weight="bold" className="w-3.5 h-3.5" /> Nominated identity manager</dt>
                  <dd className="mt-1 font-medium text-slate-800 break-words">
                    {organization.nominatedImName || 'Not provided'}
                    {organization.nominatedImEmail && <span className="block text-slate-500 font-normal">{organization.nominatedImEmail}</span>}
                  </dd>
                </div>
                <div className="sm:col-span-2 flex items-center gap-1.5 text-slate-500 px-1">
                  <Calendar weight="bold" className="w-3.5 h-3.5" /> Submitted {new Date(organization.createdAt).toLocaleDateString()}
                </div>
              </dl>

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Link
                  to={`/admin/requests/${organization.id}`}
                  className="inline-flex justify-center items-center gap-1 px-3 py-2 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#334155] text-xs font-semibold rounded-md transition-colors"
                >
                  Review details <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => approveOrganization(organization.id)}
                  className="inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors"
                >
                  <CheckCircle weight="bold" className="w-4 h-4" /> Accept organization
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
