import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { List, SignOut } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { ROLE_LABEL } from '@/lib/access'

export interface HeaderBarProps {
  onToggleMobileMenu: () => void
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onToggleMobileMenu }) => {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  if (!currentUser) return null

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'Dashboard'
    if (path === '/citizen/verification-history') return 'Verification History'
    if (path === '/citizen/presentations') return 'Presentations'
    if (path === '/citizen/settings' || path === '/admin/settings') return 'Settings'
    if (path === '/citizen/profile' || path === '/org/profile') return 'Profile'
    if (path === '/org/activity') return 'Activity Log'
    if (path === '/org/issue' || path === '/im/issue') return 'Issue Credential'
    if (path === '/im/create-identity') return 'Create Identity'
    if (path === '/im/review-queue') return 'Review Queue'
    if (path === '/im/templates') return 'Credential Templates'
    if (path === '/im/identities') return 'Identity Directory'
    if (path === '/org/identities') return 'Citizen Identities'
    if (path === '/admin/identity-managers') return 'Identity Managers'
    if (path === '/admin/system-status') return 'System Status'
    if (path === '/admin/users') return 'User Accounts'
    if (path === '/admin/api') return 'API Reference'
    if (path.includes('/details')) return 'Details'
    if (path === '/im/profile') return 'Profile'
    if (path.includes('/managers/add')) return 'Add Identity Manager'
    if (path.includes('/managers')) return 'Identity Managers'
    if (path.includes('/citizens/register')) return 'Register Citizen'
    if (path.includes('/citizens')) return 'Citizens'
    if (path.endsWith('/issue') || path.includes('/credentials/issue')) return 'Issue Credential'
    if (path.includes('/credentials')) return 'Credentials'
    if (path.includes('/credential')) return 'My Credential'
    if (path.includes('/requests')) return 'Organization Requests'
    if (path.includes('/organizations')) return 'Approved Organizations'
    if (path.includes('/audit')) return 'Audit Logs'
    return 'ShieldID Portal'
  }

  const handleSignOut = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          <List weight="bold" className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-semibold text-[#0F172A] leading-tight">
            {getPageTitle()}
          </h2>
          <span className="text-xs text-[#64748B]">
            {ROLE_LABEL[currentUser.role]} Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-[#0F172A]">{currentUser.name}</p>
          <p className="text-[11px] text-[#64748B]">{currentUser.email}</p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
          title="Sign out"
        >
          <SignOut weight="bold" className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
