import React, { useMemo } from 'react'
import { ListChecks, ShieldCheck, CheckCircle, Warning, XCircle } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDateTime } from '@/lib/dates'

export const CitizenVerificationHistoryPage: React.FC = () => {
  const { state, currentUser } = useApp()

  const myIdentity = state.identities.find(
    (i) => i.userId === currentUser?.id || i.id === currentUser?.identityId,
  )

  const myCredentials = state.credentials.filter(
    (c) => c.identityId === myIdentity?.id || (myIdentity?.did && c.subjectDid === myIdentity.did),
  )

  const myCredentialIds = myCredentials.map((c) => c.id)

  const myVerifications = useMemo(() => {
    return state.verifications.filter((v) => {
      return (
        (v.credentialId && myCredentialIds.includes(v.credentialId)) ||
        v.actorUserId === currentUser?.id
      )
    })
  }, [state.verifications, myCredentialIds, currentUser])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Verification History & Access Log
        </h1>
        <p className="text-sm text-slate-500">
          Audit trail of third parties and services that performed verification checks against your credentials
        </p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-2xs">
        {myVerifications.length === 0 ? (
          <EmptyState
            icon={<ListChecks weight="fill" className="w-8 h-8 text-slate-400" />}
            title="No verification events recorded"
            description="None of your credentials or active presentation shares have been evaluated by an external verifier yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Verification ID</th>
                  <th className="px-4 py-3">Credential ID</th>
                  <th className="px-4 py-3">Verifier Actor</th>
                  <th className="px-4 py-3">Outcome Status</th>
                  <th className="px-4 py-3">Verification Summary</th>
                  <th className="px-4 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myVerifications.map((ver) => (
                  <tr key={ver.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-900 font-medium">
                      {ver.id}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-blue-700">
                      {ver.credentialId || ver.presentationId || 'Direct Submission'}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {ver.actorName}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={ver.outcome}>
                        {ver.outcome.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-sm leading-normal">
                      {ver.summary}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-right whitespace-nowrap">
                      {formatDateTime(ver.verifiedAt)}
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
