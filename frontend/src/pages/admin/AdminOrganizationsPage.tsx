import React, { useState } from 'react'
import { Buildings, Trash } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { formatDate } from '@/lib/dates'

export const AdminOrganizationsPage: React.FC = () => {
  const { state, removeOrganization } = useApp()
  const [organizationToRemove, setOrganizationToRemove] = useState<string | null>(null)
  const organizations = state.organizations
  const selectedOrganization = organizations.find((organization) => organization.id === organizationToRemove)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Organizations</h1>
        <p className="text-sm text-slate-500 mt-1">View, approve, and remove organization records.</p>
      </header>

      {organizations.length === 0 ? (
        <EmptyState
          icon={<Buildings weight="fill" className="w-6 h-6 text-slate-400" />}
          title="No organizations yet"
          description="Organization applications and approved organizations will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {organizations.map((organization) => (
            <article key={organization.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-slate-900 truncate">{organization.name}</h2>
                  <p className="text-sm text-slate-500">{organization.orgType}</p>
                </div>
                <Badge variant={organization.status === 'active' ? 'green' : organization.status === 'pending' ? 'amber' : 'red'}>
                  {organization.status === 'active' ? 'Approved' : organization.status === 'pending' ? 'Pending' : 'Inactive'}
                </Badge>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="min-w-0">
                  <dt className="text-xs text-slate-500">Official email</dt>
                  <dd className="truncate text-slate-800">{organization.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Approved</dt>
                  <dd className="text-slate-800">{organization.approvedAt ? formatDate(organization.approvedAt) : '—'}</dd>
                </div>
              </dl>
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-500 mb-1">Organization DID</p>
                <p className="font-mono text-xs text-slate-700 break-all">{organization.did || 'Not assigned'}</p>
              </div>
              <div className="flex justify-end border-t border-slate-100 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setOrganizationToRemove(organization.id)}
                  icon={<Trash weight="bold" className="w-4 h-4" />}
                >
                  Remove organization
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(selectedOrganization)}
        onClose={() => setOrganizationToRemove(null)}
        onConfirm={() => {
          if (selectedOrganization) removeOrganization(selectedOrganization.id)
          setOrganizationToRemove(null)
        }}
        title="Remove this organization?"
        confirmLabel="Remove organization"
        confirmVariant="danger"
      >
        <p>
          This removes <strong>{selectedOrganization?.name}</strong> and its linked demo accounts, identities, credentials, and related records from this browser. The removal is recorded in the audit log.
        </p>
      </ConfirmDialog>
    </div>
  )
}
