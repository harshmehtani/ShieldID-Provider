import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IdentificationCard,
  PlusCircle,
  Eye,
  Certificate,
  Copy,
  Check,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { SearchFilterBar } from '@/components/common/SearchFilterBar'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate } from '@/lib/dates'

export const OrgIdentitiesPage: React.FC = () => {
  const { state, currentUser } = useApp()
  const navigate = useNavigate()

  const orgId = currentUser?.organizationId || state.organizations[0]?.id

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  const [copiedDid, setCopiedDid] = useState<string | null>(null)

  const orgIdentities = useMemo(() => {
    return state.identities.filter((i) => i.organizationId === orgId)
  }, [state.identities, orgId])

  const filtered = useMemo(() => {
    return orgIdentities.filter((idn) => {
      const matchesSearch =
        idn.fullName.toLowerCase().includes(search.toLowerCase()) ||
        idn.email.toLowerCase().includes(search.toLowerCase()) ||
        (idn.did && idn.did.toLowerCase().includes(search.toLowerCase())) ||
        (idn.idReference || '').toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || idn.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orgIdentities, search, statusFilter])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const copyDid = (did: string) => {
    navigator.clipboard.writeText(did)
    setCopiedDid(did)
    setTimeout(() => setCopiedDid(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Registered Citizen Identities
          </h1>
          <p className="text-sm text-slate-500">
            Directory of identity holders registered with Decentralized Identifiers
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/org/issue')}
          icon={<PlusCircle weight="fill" className="w-4 h-4" />}
        >
          Issue Credential to Citizen
        </Button>
      </div>

      {/* Filter & Table Box */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <SearchFilterBar
          searchQuery={search}
          onSearchChange={(q) => {
            setSearch(q)
            setCurrentPage(1)
          }}
          placeholder="Search citizens by name, email, DID, or ID reference..."
          statusFilter={statusFilter}
          onStatusChange={(s) => {
            setStatusFilter(s)
            setCurrentPage(1)
          }}
          statusOptions={[
            { label: 'Active', value: 'active' },
            { label: 'Pending Review', value: 'pending_review' },
            { label: 'Rejected', value: 'rejected' },
          ]}
          onReset={() => {
            setSearch('')
            setStatusFilter('all')
            setCurrentPage(1)
          }}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={<IdentificationCard weight="fill" className="w-6 h-6 text-slate-400" />}
            title="No citizens found"
            description="No identity records match your search filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Citizen Name</th>
                  <th className="px-4 py-3">Decentralized Identifier (DID)</th>
                  <th className="px-4 py-3">Email & Phone</th>
                  <th className="px-4 py-3">ID Reference</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((idn) => {
                  return (
                    <tr key={idn.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{idn.fullName}</div>
                        <div className="text-[11px] text-slate-400">{idn.id}</div>
                      </td>
                      <td className="px-4 py-3.5 max-w-[220px]">
                        {idn.did ? (
                          <div className="flex items-center gap-1.5 font-mono text-slate-700">
                            <span className="truncate">{idn.did}</span>
                            <button
                              type="button"
                              onClick={() => copyDid(idn.did!)}
                              className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5"
                              title="Copy DID"
                            >
                              {copiedDid === idn.did ? (
                                <Check weight="bold" className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy weight="fill" className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">DID pending generation</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-slate-800">{idn.email}</div>
                        <div className="text-[11px] text-slate-400">{idn.phone}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {idn.idReference}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={idn.status}>{idn.status.replace('_', ' ').toUpperCase()}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono">
                        {formatDate(idn.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/org/issue')}
                          icon={<Certificate weight="fill" className="w-3.5 h-3.5 text-blue-600" />}
                        >
                          Issue
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
