import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IdentificationCard,
  UserPlus,
  MagnifyingGlass,
  ArrowRight,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'

export const ImCitizensPage: React.FC = () => {
  const { state, currentUser } = useApp()
  const [search, setSearch] = useState('')

  if (!currentUser || !currentUser.organizationId) {
    return null
  }

  const identities = state.identities.filter(
    (i) => i.organizationId === currentUser.organizationId,
  )

  const filtered = identities.filter(
    (i) =>
      i.fullName.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase()) ||
      (i.did && i.did.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Registered Citizens</h1>
          <p className="text-xs text-[#64748B]">
            Citizen identity records and demo identifiers created by this organization
          </p>
        </div>

        <Link
          to="/im/citizens/register"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors shadow-xs self-start sm:self-auto"
        >
          <UserPlus weight="bold" className="w-4 h-4" />
          <span>Register Citizen</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
        <div className="relative max-w-md">
          <MagnifyingGlass weight="bold" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or DID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <IdentificationCard weight="fill" className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#0F172A] mb-1">
              No Citizens Found
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mb-4">
              {search
                ? 'No citizen matches your search query.'
                : 'Get started by registering your first citizen identity subject.'}
            </p>
            {!search && (
              <Link
                to="/im/citizens/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-md hover:bg-[#1D4ED8]"
              >
                <UserPlus weight="bold" className="w-3.5 h-3.5" />
                <span>Register Citizen</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Full Name</th>
                  <th className="px-6 py-3.5">Email Address</th>
                  <th className="px-6 py-3.5">Date of Birth</th>
                  <th className="px-6 py-3.5">Decentralized ID (DID)</th>
                  <th className="px-6 py-3.5">Registered</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((cit) => (
                  <tr key={cit.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">
                      {cit.fullName}
                    </td>
                    <td className="px-6 py-4 text-[#334155]">{cit.email}</td>
                    <td className="px-6 py-4 text-[#64748B]">{cit.dateOfBirth}</td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-600">
                      {cit.did ? `${cit.did.slice(0, 16)}...` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-[#64748B]">
                      {new Date(cit.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/im/citizens/${cit.id}`}
                        className="inline-flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8] font-semibold hover:underline"
                      >
                        <span>View Details</span>
                        <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
