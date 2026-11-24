import React, { useMemo, useState } from 'react'
import { User } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchFilterBar } from '@/components/common/SearchFilterBar'
import { formatDate } from '@/lib/dates'

export const AdminIdentityManagersPage: React.FC = () => {
  const { state, updateUserStatus } = useApp()
  const [search, setSearch] = useState('')

  const managers = useMemo(() => state.users.filter((user) => {
    if (user.role !== 'identity_manager') return false
    const organization = state.organizations.find((entry) => entry.id === user.organizationId)
    const query = search.trim().toLowerCase()
    return !query || [user.name, user.email, organization?.name || ''].some((value) => value.toLowerCase().includes(query))
  }), [state.users, state.organizations, search])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Identity Managers</h1>
        <p className="text-sm text-slate-500 mt-1">
          Managers are invited by their organization. Administrators can review account status here.
        </p>
      </header>

      <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <SearchFilterBar
          searchQuery={search}
          onSearchChange={setSearch}
          placeholder="Search manager or organization..."
          onReset={() => setSearch('')}
        />

        {managers.length === 0 ? (
          <EmptyState
            icon={<User weight="fill" className="w-6 h-6 text-slate-400" />}
            title="No identity managers found"
            description="Managers invited by approved organizations will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Added</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {managers.map((manager) => {
                  const organization = state.organizations.find((entry) => entry.id === manager.organizationId)
                  const active = manager.status === 'active'
                  return (
                    <tr key={manager.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5 font-semibold text-slate-900">{manager.name}</td>
                      <td className="px-4 py-3.5 text-slate-700">{manager.email}</td>
                      <td className="px-4 py-3.5 text-slate-700">{organization?.name || 'Unassigned'}</td>
                      <td className="px-4 py-3.5 text-slate-500">{formatDate(manager.createdAt)}</td>
                      <td className="px-4 py-3.5"><Badge variant={manager.status}>{manager.status.toUpperCase()}</Badge></td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className={active ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}
                          onClick={() => updateUserStatus(manager.id, active ? 'suspended' : 'active')}
                        >
                          {active ? 'Suspend' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
