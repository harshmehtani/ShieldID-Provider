import React from 'react'
import { User, Buildings, Envelope, Calendar, ShieldCheck } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'

export const ImProfilePage: React.FC = () => {
  const { state, currentUser } = useApp()

  if (!currentUser) return null

  const org = state.organizations.find((o) => o.id === currentUser.organizationId)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-4 pb-6 border-b border-[#E2E8F0] mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xl">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">{currentUser.name}</h1>
            <p className="text-xs text-[#64748B]">Operational Identity Manager</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <Envelope weight="bold" className="w-3.5 h-3.5" />
                <span>Email Address</span>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">{currentUser.email}</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <Buildings weight="bold" className="w-3.5 h-3.5" />
                <span>Accredited Organization</span>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">{org?.name || 'Authorized Institution'}</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <ShieldCheck weight="bold" className="w-3.5 h-3.5" />
                <span>Account Status</span>
              </div>
              <div>
                <Badge variant={currentUser.status === 'active' ? 'green' : 'red'}>
                  {currentUser.status === 'active' ? 'Active Delegate' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                <Calendar weight="bold" className="w-3.5 h-3.5" />
                <span>Provisioned Timestamp</span>
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs text-[#64748B]">
            <p className="font-semibold text-[#0F172A] mb-1">Delegated Authority Notice:</p>
            <p>
              Your account is authorized to perform citizen identity onboarding and credential issuance on behalf of <strong>{org?.name}</strong>. Operations performed under this session are recorded in the system audit logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
