import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Certificate,
  ShareNetwork,
  Eye,
  Warning,
  CheckCircle,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { SearchFilterBar } from '@/components/common/SearchFilterBar'
import { EmptyState } from '@/components/common/EmptyState'
import { formatOptionalDate, daysUntil } from '@/lib/dates'
import { registryStatus } from '@/lib/credential'

export const CitizenCredentialsPage: React.FC = () => {
  const { state, currentUser } = useApp()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const myIdentity = state.identities.find(
    (i) => i.userId === currentUser?.id || i.id === currentUser?.identityId,
  )

  const myCredentials = useMemo(() => {
    return state.credentials.filter(
      (c) => c.identityId === myIdentity?.id || (myIdentity?.did && c.subjectDid === myIdentity.did),
    )
  }, [state.credentials, myIdentity])

  const filtered = useMemo(() => {
    return myCredentials.filter((cred) => {
      const regStat = registryStatus(cred)
      const matchesSearch =
        cred.title.toLowerCase().includes(search.toLowerCase()) ||
        cred.type.toLowerCase().includes(search.toLowerCase()) ||
        cred.issuerName.toLowerCase().includes(search.toLowerCase()) ||
        cred.id.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || regStat === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [myCredentials, search, statusFilter])

  // Near expiry check (<30 days)
  const expiringSoon = myCredentials.filter((c) => {
    const stat = registryStatus(c)
    if (stat !== 'issued') return false
    if (!c.expiresAt) return false
    const days = daysUntil(c.expiresAt)
    return days > 0 && days <= 30
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Verifiable Credentials
          </h1>
          <p className="text-sm text-slate-500">
            Digital credentials stored in your sovereign identity record
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/citizen/presentations')}
          icon={<ShareNetwork weight="fill" className="w-4 h-4" />}
        >
          Present & Share Claims
        </Button>
      </div>

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
          <Warning weight="fill" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold block mb-0.5">Credential Expiration Notice</span>
            You have {expiringSoon.length} credential{expiringSoon.length > 1 ? 's' : ''} expiring within the next 30 days. Contact the issuing authority to request a refreshed credential.
          </div>
        </div>
      )}

      {/* Filters & Grid */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <SearchFilterBar
          searchQuery={search}
          onSearchChange={setSearch}
          placeholder="Search my credentials by title, type, or issuer..."
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={[
            { label: 'Active', value: 'issued' },
            { label: 'Expired', value: 'expired' },
            { label: 'Revoked', value: 'revoked' },
          ]}
          onReset={() => {
            setSearch('')
            setStatusFilter('all')
          }}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Certificate weight="fill" className="w-6 h-6 text-slate-400" />}
            title="No credentials found"
            description="No credentials matched your search criteria."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {filtered.map((cred) => {
              const regStat = registryStatus(cred)
              const daysLeft = cred.expiresAt ? daysUntil(cred.expiresAt) : null

              return (
                <div
                  key={cred.id}
                  className="rounded-lg border border-slate-200 p-5 bg-white hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                          {cred.type}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                          {cred.title || cred.type}
                        </h3>
                      </div>
                      <Badge variant={regStat}>{regStat.toUpperCase()}</Badge>
                    </div>

                    <p className="text-xs text-slate-500 mb-3">
                      Issued by <span className="font-semibold text-slate-700">{cred.issuerName}</span>
                    </p>

                    {/* Claims Preview */}
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-100 text-xs space-y-1 mb-4">
                      {Object.entries(cred.claims).slice(0, 3).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[11px]">
                          <span className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-medium text-slate-800 text-right truncate max-w-[180px]">{v}</span>
                        </div>
                      ))}
                      {Object.keys(cred.claims).length > 3 && (
                        <p className="text-[10px] text-slate-400 text-right pt-0.5 italic">
                          +{Object.keys(cred.claims).length - 3} more attributes
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Expires: {formatOptionalDate(cred.expiresAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/citizen/credentials/${cred.id}`)}
                        icon={<Eye weight="fill" className="w-3.5 h-3.5" />}
                      >
                        Inspect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/citizen/presentations')}
                        icon={<ShareNetwork weight="fill" className="w-3.5 h-3.5 text-blue-600" />}
                      >
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
