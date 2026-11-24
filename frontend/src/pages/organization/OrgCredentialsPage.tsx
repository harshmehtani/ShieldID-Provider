import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Certificate,
  PlusCircle,
  Eye,
  Warning,
  ShieldCheck,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { SearchFilterBar } from '@/components/common/SearchFilterBar'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { formatDate, formatOptionalDate } from '@/lib/dates'
import { registryStatus } from '@/lib/credential'

export const OrgCredentialsPage: React.FC = () => {
  const { state, currentUser, revokeCredential } = useApp()
  const navigate = useNavigate()

  const orgId = currentUser?.organizationId || state.organizations[0]?.id

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Revoke state
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [revokeReason, setRevokeReason] = useState('')

  const orgCredentials = useMemo(() => {
    return state.credentials.filter((c) => c.organizationId === orgId)
  }, [state.credentials, orgId])

  const filtered = useMemo(() => {
    return orgCredentials.filter((cred) => {
      const regStat = registryStatus(cred)
      const matchesSearch =
        cred.id.toLowerCase().includes(search.toLowerCase()) ||
        cred.subjectName.toLowerCase().includes(search.toLowerCase()) ||
        cred.type.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || regStat === statusFilter
      const matchesType = typeFilter === 'all' || cred.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [orgCredentials, search, statusFilter, typeFilter])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleConfirmRevoke = () => {
    if (!revokingId) return
    revokeCredential(revokingId, revokeReason || 'Administrative revocation by issuing authority.')
    setRevokingId(null)
    setRevokeReason('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Issued Verifiable Credentials
          </h1>
          <p className="text-sm text-slate-500">
            Lifecycle registry of all credentials issued by this organization
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/org/issue')}
          icon={<PlusCircle weight="fill" className="w-4 h-4" />}
        >
          Issue New Credential
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <SearchFilterBar
          searchQuery={search}
          onSearchChange={(q) => {
            setSearch(q)
            setCurrentPage(1)
          }}
          placeholder="Search by ID, citizen name, or credential type..."
          statusFilter={statusFilter}
          onStatusChange={(s) => {
            setStatusFilter(s)
            setCurrentPage(1)
          }}
          statusOptions={[
            { label: 'Issued (Active)', value: 'issued' },
            { label: 'Expired', value: 'expired' },
            { label: 'Revoked', value: 'revoked' },
            { label: 'Pending', value: 'pending' },
          ]}
          categoryFilter={typeFilter}
          onCategoryChange={(t) => {
            setTypeFilter(t)
            setCurrentPage(1)
          }}
          categoryOptions={[
            { label: 'Identity Credential', value: 'IdentityCredential' },
            { label: 'Education Credential', value: 'EducationCredential' },
            { label: 'Employment Credential', value: 'EmploymentCredential' },
          ]}
          categoryLabel="Template"
          onReset={() => {
            setSearch('')
            setStatusFilter('all')
            setTypeFilter('all')
            setCurrentPage(1)
          }}
        />

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Certificate weight="fill" className="w-6 h-6 text-slate-400" />}
            title="No credentials found"
            description={
              search || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No credential records match your search criteria.'
                : 'Your organization has not issued any verifiable credentials yet.'
            }
            actionLabel="Issue First Credential"
            onAction={() => navigate('/org/issue')}
            actionIcon={<PlusCircle weight="fill" className="w-4 h-4" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Credential ID</th>
                  <th className="px-4 py-3">Subject Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Issued Date</th>
                  <th className="px-4 py-3">Expiration</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((cred) => {
                  const regStat = registryStatus(cred)
                  const isRevoked = cred.status === 'revoked'

                  return (
                    <tr key={cred.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-medium text-slate-900">
                        {cred.id}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {cred.subjectName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {cred.type}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={regStat}>{regStat.toUpperCase()}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono">
                        {formatDate(cred.issuedAt)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono">
                        {formatOptionalDate(cred.expiresAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/org/credentials/${cred.id}`)}
                          icon={<Eye weight="fill" className="w-3.5 h-3.5" />}
                        >
                          Details
                        </Button>
                        {!isRevoked && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setRevokingId(cred.id)}
                            icon={<Warning weight="fill" className="w-3.5 h-3.5" />}
                          >
                            Revoke
                          </Button>
                        )}
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

      {/* Revocation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(revokingId)}
        onClose={() => {
          setRevokingId(null)
          setRevokeReason('')
        }}
        onConfirm={handleConfirmRevoke}
        title="Revoke Verifiable Credential"
        message={`Are you sure you want to revoke credential ${revokingId}? This action will immediately update the credential registry and cause future verification checks to fail.`}
        confirmText="Confirm Revocation"
        variant="danger"
      />
    </div>
  )
}
