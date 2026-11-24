import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Certificate,
  Eye,
  ShieldCheck,
  Warning,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { SearchFilterBar } from '@/components/common/SearchFilterBar'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate, formatOptionalDate } from '@/lib/dates'
import { registryStatus } from '@/lib/credential'

export const AdminCredentialsPage: React.FC = () => {
  const { state } = useApp()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [orgFilter, setOrgFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  const filtered = useMemo(() => {
    return state.credentials.filter((cred) => {
      const regStat = registryStatus(cred)
      const matchesSearch =
        cred.id.toLowerCase().includes(search.toLowerCase()) ||
        cred.subjectName.toLowerCase().includes(search.toLowerCase()) ||
        cred.issuerName.toLowerCase().includes(search.toLowerCase()) ||
        cred.type.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || regStat === statusFilter
      const matchesOrg = orgFilter === 'all' || cred.organizationId === orgFilter
      return matchesSearch && matchesStatus && matchesOrg
    })
  }, [state.credentials, search, statusFilter, orgFilter])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            System-Wide Credential Registry
          </h1>
          <p className="text-sm text-slate-500">
            Global monitoring of all verifiable credentials issued across participant organizations
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => navigate('/verify')}
          icon={<ShieldCheck weight="fill" className="w-4 h-4 text-blue-600" />}
        >
          Open Verification Engine
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <SearchFilterBar
          searchQuery={search}
          onSearchChange={(q) => {
            setSearch(q)
            setCurrentPage(1)
          }}
          placeholder="Search by ID, subject, issuer, or credential type..."
          statusFilter={statusFilter}
          onStatusChange={(s) => {
            setStatusFilter(s)
            setCurrentPage(1)
          }}
          statusOptions={[
            { label: 'Active', value: 'issued' },
            { label: 'Expired', value: 'expired' },
            { label: 'Revoked', value: 'revoked' },
            { label: 'Pending', value: 'pending' },
          ]}
          categoryFilter={orgFilter}
          onCategoryChange={(o) => {
            setOrgFilter(o)
            setCurrentPage(1)
          }}
          categoryOptions={state.organizations.map((org) => ({
            label: org.name,
            value: org.id,
          }))}
          categoryLabel="Organization"
          onReset={() => {
            setSearch('')
            setStatusFilter('all')
            setOrgFilter('all')
            setCurrentPage(1)
          }}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Certificate weight="fill" className="w-6 h-6 text-slate-400" />}
            title="No credentials found"
            description="No credentials match your search criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Credential ID</th>
                  <th className="px-4 py-3">Subject (Holder)</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Issuer Organization</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Issued Date</th>
                  <th className="px-4 py-3">Expiration</th>
                  <th className="px-4 py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((cred) => {
                  const regStat = registryStatus(cred)

                  return (
                    <tr key={cred.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-medium text-slate-900">
                        {cred.id}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {cred.subjectName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{cred.type}</td>
                      <td className="px-4 py-3.5 text-slate-700">{cred.issuerName}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={regStat}>{regStat.toUpperCase()}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono">
                        {formatDate(cred.issuedAt)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono">
                        {formatOptionalDate(cred.expiresAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/org/credentials/${cred.id}`)}
                          icon={<Eye weight="fill" className="w-3.5 h-3.5" />}
                        >
                          Details
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
