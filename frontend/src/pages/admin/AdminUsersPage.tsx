import React, { useMemo, useState } from 'react'
import { Buildings, Certificate, User, Users } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchFilterBar } from '@/components/common/SearchFilterBar'
import { formatDate } from '@/lib/dates'
import type { User as UserRecord } from '@/types'

export const AdminUsersPage: React.FC = () => {
  const { state, updateUserStatus, showToast } = useApp()
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()

  const matches = (values: Array<string | undefined>) =>
    !query || values.some((value) => value?.toLowerCase().includes(query))

  const organizations = useMemo(() => state.organizations.map((organization) => {
    const organizationMatches = matches([organization.name, organization.email])
    const orgUsers = state.users.filter((user) => user.organizationId === organization.id)
    const organizationAccount = orgUsers.find((user) => user.role === 'organization')
    const managers = orgUsers.filter((user) => user.role === 'identity_manager')
    const citizens = orgUsers.filter((user) => user.role === 'citizen')
    const identities = state.identities.filter((identity) => identity.organizationId === organization.id)

    const managerGroups = managers.map((manager) => {
      const registeredIdentities = identities.filter((identity) => identity.createdByUserId === manager.id)
      const linkedCitizenIds = new Set(registeredIdentities.flatMap((identity) => [identity.userId, identity.id]).filter(Boolean))
      const linkedCitizens = citizens.filter((citizen) => linkedCitizenIds.has(citizen.id) || linkedCitizenIds.has(citizen.identityId || ''))
      const unlinkedCitizens = registeredIdentities.filter((identity) => !linkedCitizens.some((citizen) => citizen.id === identity.userId || citizen.identityId === identity.id))
      const matchesSearch = matches([manager.name, manager.email, organization.name]) ||
        linkedCitizens.some((citizen) => matches([citizen.name, citizen.email])) ||
        unlinkedCitizens.some((identity) => matches([identity.fullName, identity.email]))
      return { manager, linkedCitizens, unlinkedCitizens, matchesSearch }
    }).filter((group) => !query || organizationMatches || group.matchesSearch)

    const assignedCitizenIds = new Set(managerGroups.flatMap((group) => group.linkedCitizens.map((citizen) => citizen.id)))
    const otherCitizens = citizens.filter((citizen) =>
      !assignedCitizenIds.has(citizen.id) && (!query || organizationMatches || matches([citizen.name, citizen.email])),
    )
    const isMatch = !query || organizationMatches ||
      (organizationAccount ? matches([organizationAccount.name, organizationAccount.email]) : false) ||
      managerGroups.length > 0 || otherCitizens.length > 0

    return { organization, organizationAccount, managerGroups, otherCitizens, isMatch }
  }).filter((group) => group.isMatch), [state.organizations, state.users, state.identities, query])

  const hasResults = organizations.length > 0

  const handleResetPassword = (user: UserRecord) => {
    showToast('info', 'Password reset demo', `No email was sent for ${user.name}; connect the backend mail service to enable recovery.`)
  }

  const renderAccountActions = (user: UserRecord) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button variant="ghost" size="sm" onClick={() => handleResetPassword(user)}>Reset password</Button>
      <Button
        variant="outline"
        size="sm"
        className={user.status === 'active' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}
        onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}
      >
        {user.status === 'active' ? 'Suspend' : 'Activate'}
      </Button>
    </div>
  )

  const renderCitizen = (user: UserRecord) => {
    const identity = state.identities.find((entry) => entry.id === user.identityId || entry.userId === user.id)
    const credentials = state.credentials.filter((credential) => credential.identityId === identity?.id)
    return (
      <article key={user.id} className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <User weight="fill" className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 break-all">{user.email}</p>
              <p className="text-[11px] text-slate-400 mt-1">Registered {identity?.createdAt ? formatDate(identity.createdAt) : formatDate(user.createdAt)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Badge variant={user.status}>{user.status.toUpperCase()}</Badge>
            {renderAccountActions(user)}
          </div>
        </div>
        <details className="border-t border-slate-100 pt-3">
          <summary className="cursor-pointer list-none flex items-center gap-2 text-xs font-semibold text-blue-700">
            <Certificate weight="fill" className="w-4 h-4" />
            Credentials ({credentials.length})
          </summary>
          {credentials.length === 0 ? (
            <p className="mt-3 text-xs text-slate-500">No credential records are linked to this citizen.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {credentials.map((credential) => (
                <li key={credential.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800">{credential.title}</p>
                    <p className="text-[11px] text-slate-500">Issued {formatDate(credential.issuedAt)} · {credential.id}</p>
                  </div>
                  <Badge variant={credential.status}>{credential.status.toUpperCase()}</Badge>
                </li>
              ))}
            </ul>
          )}
        </details>
      </article>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">User Accounts</h1>
        <p className="text-sm text-slate-500 mt-1">Browse accounts by organization, then by the identity manager who registered each citizen. Citizen credentials are listed inside each account.</p>
      </header>

      <section className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <SearchFilterBar searchQuery={search} onSearchChange={setSearch} placeholder="Search organizations, managers, or citizens..." onReset={() => setSearch('')} />
        {!hasResults ? (
          <EmptyState icon={<Users weight="fill" className="w-6 h-6 text-slate-400" />} title="No user accounts found" description="No organization, manager, citizen, or administrator account matches the search." />
        ) : (
          <div className="space-y-4">
            {organizations.map(({ organization, organizationAccount, managerGroups, otherCitizens }) => (
              <details key={organization.id} open className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden">
                <summary className="cursor-pointer list-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 bg-white border-b border-slate-200">
                  <div className="flex items-start gap-3 min-w-0">
                    <Buildings weight="fill" className="w-5 h-5 mt-0.5 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{organization.name}</p>
                      <p className="text-xs text-slate-500">{organization.email} · {managerGroups.length} identity manager{managerGroups.length === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  <Badge variant={organization.status === 'active' ? 'green' : organization.status === 'pending' ? 'amber' : 'red'}>{organization.status.toUpperCase()}</Badge>
                </summary>
                <div className="p-4 space-y-4">
                  {organizationAccount && matches([organizationAccount.name, organizationAccount.email, organization.name]) && (
                    <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide font-semibold text-blue-800">Organization account</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">{organizationAccount.name}</p>
                        <p className="text-xs text-slate-500">{organizationAccount.email}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2"><Badge variant={organizationAccount.status}>{organizationAccount.status.toUpperCase()}</Badge>{renderAccountActions(organizationAccount)}</div>
                    </div>
                  )}

                  {managerGroups.map(({ manager, linkedCitizens, unlinkedCitizens }) => (
                    <details key={manager.id} open className="rounded-lg border border-slate-200 bg-white">
                      <summary className="cursor-pointer list-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <Users weight="fill" className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{manager.name}</p>
                            <p className="text-xs text-slate-500">{manager.email} · {linkedCitizens.length + unlinkedCitizens.length} registered citizen{linkedCitizens.length + unlinkedCitizens.length === 1 ? '' : 's'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:justify-end"><Badge variant={manager.status}>{manager.status.toUpperCase()}</Badge>{renderAccountActions(manager)}</div>
                      </summary>
                      <div className="border-t border-slate-100 p-4 space-y-3">
                        {linkedCitizens.map(renderCitizen)}
                        {unlinkedCitizens.map((identity) => (
                          <div key={identity.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                            {identity.fullName} ({identity.email}) has an identity record but no linked citizen account.
                          </div>
                        ))}
                        {linkedCitizens.length === 0 && unlinkedCitizens.length === 0 && <p className="text-xs text-slate-500">No citizens registered by this manager yet.</p>}
                      </div>
                    </details>
                  ))}

                  {otherCitizens.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Citizens without a matching manager record</h3>
                      {otherCitizens.map(renderCitizen)}
                    </div>
                  )}
                  {managerGroups.length === 0 && otherCitizens.length === 0 && !organizationAccount && <p className="text-xs text-slate-500">No user accounts are linked to this organization yet.</p>}
                </div>
              </details>
            ))}

          </div>
        )}
      </section>
    </div>
  )
}
