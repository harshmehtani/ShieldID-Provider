import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, User, ArrowRight } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'

export const OrgManagersPage: React.FC = () => {
  const { state, currentUser } = useApp()

  if (!currentUser || !currentUser.organizationId) {
    return null
  }

  const orgId = currentUser.organizationId
  const managers = state.users.filter(
    (u) => u.role === 'identity_manager' && u.organizationId === orgId,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Identity Managers</h1>
          <p className="text-xs text-[#64748B]">
            Authorized delegates who register citizens and issue credentials on behalf of your institution
          </p>
        </div>

        <Link
          to="/org/managers/add"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus weight="bold" className="w-4 h-4" />
          <span>Add Identity Manager</span>
        </Link>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
        {managers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Users weight="fill" className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#0F172A] mb-1">
              No Identity Managers Added
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mb-4">
              Add your first delegate to begin registering citizens and issuing credentials.
            </p>
            <Link
              to="/org/managers/add"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-md hover:bg-[#1D4ED8]"
            >
              <Plus weight="bold" className="w-3.5 h-3.5" />
              <span>Add Identity Manager</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email Address</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date Added</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {managers.map((mgr) => (
                  <tr key={mgr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#0F172A] flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                        {mgr.name.charAt(0)}
                      </div>
                      <span>{mgr.name}</span>
                    </td>
                    <td className="px-6 py-4 text-[#334155]">{mgr.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={mgr.status === 'active' ? 'green' : mgr.status === 'invited' ? 'amber' : 'red'}>
                        {mgr.status === 'active' ? 'Active' : mgr.status === 'invited' ? 'Invited' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-[#64748B]">
                      {new Date(mgr.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/org/managers/${mgr.id}`}
                        className="inline-flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8] font-semibold hover:underline"
                      >
                        <span>View Details</span>
                        <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                      </Link>
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
