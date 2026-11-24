import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Certificate,
  PlusCircle,
  MagnifyingGlass,
  ArrowRight,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { formatOptionalDate } from '@/lib/dates'
import { registryStatus } from '@/lib/credential'

export const ImCredentialsPage: React.FC = () => {
  const { state, currentUser } = useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'expired' | 'revoked'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'IdentityCredential' | 'EducationCredential' | 'EmploymentCredential'>('all')

  if (!currentUser || !currentUser.organizationId) {
    return null
  }

  const credentials = state.credentials.filter(
    (c) => c.organizationId === currentUser.organizationId,
  )

  const filtered = credentials.filter((c) => {
    const matchesSearch =
      c.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || registryStatus(c) === statusFilter
    const matchesType = typeFilter === 'all' || c.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Issued Credentials</h1>
          <p className="text-xs text-[#64748B]">
            All verifiable credentials signed on behalf of your accredited organization
          </p>
        </div>

        <Link
          to="/im/issue"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors shadow-xs self-start sm:self-auto"
        >
          <PlusCircle weight="bold" className="w-4 h-4" />
          <span>Issue Credential</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlass weight="bold" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by citizen, title, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] text-[#0F172A]"
          >
            <option value="all">All Categories</option>
            <option value="IdentityCredential">Identity</option>
            <option value="EducationCredential">Education</option>
            <option value="EmploymentCredential">Employment</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] text-[#0F172A]"
          >
            <option value="all">All Statuses</option>
            <option value="issued">Active Only</option>
            <option value="expired">Expired Only</option>
            <option value="revoked">Revoked Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Certificate weight="fill" className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#0F172A] mb-1">
              No Credentials Found
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mb-4">
              {search || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No credentials match your applied filters.'
                : 'Begin issuing verifiable credentials to registered citizens.'}
            </p>
            {!(search || statusFilter !== 'all' || typeFilter !== 'all') && (
              <Link
                to="/im/issue"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-md hover:bg-[#1D4ED8]"
              >
                <PlusCircle weight="bold" className="w-3.5 h-3.5" />
                <span>Issue Credential</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Subject (Citizen)</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Issued Date</th>
                  <th className="px-6 py-3.5">Expires</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((cred) => {
                  const status = registryStatus(cred)
                  return (
                  <tr key={cred.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">
                      {cred.subjectName}
                    </td>
                    <td className="px-6 py-4 text-[#334155]">{cred.title}</td>
                    <td className="px-6 py-4">
                      <Badge variant={status}>
                        {status === 'issued' ? 'Active' : status === 'expired' ? 'Expired' : 'Revoked'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-[#64748B]">
                      {new Date(cred.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-[#64748B]">
                      {formatOptionalDate(cred.expiresAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/im/credentials/${cred.id}`}
                        className="inline-flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8] font-semibold hover:underline"
                      >
                        <span>Inspect</span>
                        <ArrowRight weight="bold" className="w-3.5 h-3.5" />
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
