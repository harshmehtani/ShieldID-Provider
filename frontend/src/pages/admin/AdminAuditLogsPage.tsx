import React, { useState, useMemo } from 'react'
import { Clock, Eye, DownloadSimple } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { SearchFilterBar } from '@/components/common/SearchFilterBar'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDateTime } from '@/lib/dates'
import type { AuditLog } from '@/types'

export const AdminAuditLogsPage: React.FC = () => {
  const { state } = useApp()

  const [search, setSearch] = useState('')
  const [resourceFilter, setResourceFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [selectedAudit, setSelectedAudit] = useState<AuditLog | null>(null)

  const filtered = useMemo(() => {
    return state.audits.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.userName.toLowerCase().includes(search.toLowerCase()) ||
        log.resourceId.toLowerCase().includes(search.toLowerCase())
      const matchesResource = resourceFilter === 'all' || log.resource === resourceFilter
      return matchesSearch && matchesResource
    })
  }, [state.audits, search, resourceFilter])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Action', 'Resource', 'Resource ID']
    const rows = filtered.map((l) => [l.id, l.timestamp, l.userName, l.action, l.resource, l.resourceId])
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shieldid_audit_log_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            System Activity & Audit Logs
          </h1>
          <p className="text-sm text-slate-500">
            Activity records captured by this browser-based prototype
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={handleExportCsv}
          icon={<DownloadSimple weight="fill" className="w-4 h-4" />}
        >
          Export Audit CSV
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <SearchFilterBar
          searchQuery={search}
          onSearchChange={(q) => {
            setSearch(q)
            setCurrentPage(1)
          }}
          placeholder="Search by action description, actor name, or resource ID..."
          categoryFilter={resourceFilter}
          onCategoryChange={(r) => {
            setResourceFilter(r)
            setCurrentPage(1)
          }}
          categoryOptions={[
            { label: 'Identity', value: 'identity' },
            { label: 'Credential', value: 'credential' },
            { label: 'Organization', value: 'organization' },
            { label: 'Verification', value: 'verification' },
            { label: 'User', value: 'user' },
            { label: 'Presentation', value: 'presentation' },
          ]}
          categoryLabel="Resource"
          onReset={() => {
            setSearch('')
            setResourceFilter('all')
            setCurrentPage(1)
          }}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Clock weight="fill" className="w-6 h-6 text-slate-400" />}
            title="No audit records found"
            description="No audit logs matched your query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor / User</th>
                  <th className="px-4 py-3">Operation Description</th>
                  <th className="px-4 py-3">Resource Type</th>
                  <th className="px-4 py-3">Target ID</th>
                  <th className="px-4 py-3 text-right">Details</th>
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
                    <td className="px-4 py-3.5 text-slate-800 leading-normal max-w-sm truncate">
                      {log.action}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="neutral">{log.resource.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500 text-[11px]">
                      {log.resourceId}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAudit(log)}
                        icon={<Eye weight="fill" className="w-3.5 h-3.5" />}
                      >
                        Inspect
                      </Button>
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

      {/* Inspect Audit Entry Modal */}
      {selectedAudit && (
        <Modal
          isOpen={Boolean(selectedAudit)}
          onClose={() => setSelectedAudit(null)}
          title="Audit Record Detail"
          subtitle={`Entry ID: ${selectedAudit.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div>
                <span className="text-slate-400 block font-medium uppercase text-[10px]">Actor / User:</span>
                <span className="font-semibold text-slate-900">{selectedAudit.userName} ({selectedAudit.userId})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium uppercase text-[10px]">Timestamp:</span>
                <span className="font-mono text-slate-800">{selectedAudit.timestamp}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium uppercase text-[10px]">Resource:</span>
                <Badge variant="blue">{selectedAudit.resource.toUpperCase()} : {selectedAudit.resourceId}</Badge>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px] mb-1">Action Performed:</span>
              <p className="text-slate-800 p-2.5 bg-white border border-slate-200 rounded-md leading-relaxed font-medium">
                {selectedAudit.action}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
