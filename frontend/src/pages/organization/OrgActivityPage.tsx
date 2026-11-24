import React, { useState, useMemo } from 'react'
import { Clock, MagnifyingGlass } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { Pagination } from '@/components/common/Pagination'
import { formatDateTime } from '@/lib/dates'
import { EmptyState } from '@/components/common/EmptyState'

export const OrgActivityPage: React.FC = () => {
  const { state, currentUser } = useApp()
  const orgId = currentUser?.organizationId || state.organizations[0]?.id

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const orgAudits = useMemo(() => {
    return state.audits.filter((a) => a.organizationId === orgId)
  }, [state.audits, orgId])

  const filtered = useMemo(() => {
    return orgAudits.filter((a) => {
      return (
        a.action.toLowerCase().includes(search.toLowerCase()) ||
        a.userName.toLowerCase().includes(search.toLowerCase()) ||
        a.resource.toLowerCase().includes(search.toLowerCase()) ||
        a.resourceId.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [orgAudits, search])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Organization Activity & Audit Trail
        </h1>
        <p className="text-sm text-slate-500">
          Immutable audit records of all credential issuances, revocations, and identity operations
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        {/* Search */}
        <div className="relative mb-4 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MagnifyingGlass weight="fill" className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search activity by action, actor, or resource ID..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Clock weight="fill" className="w-6 h-6 text-slate-400" />}
            title="No activity records"
            description="No audit logs matched your search query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Operation / Action</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Resource ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {log.userName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 leading-normal">
                      {log.action}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="neutral">{log.resource.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500 text-[11px]">
                      {log.resourceId}
                    </td>
                  </tr>
                ))}
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
