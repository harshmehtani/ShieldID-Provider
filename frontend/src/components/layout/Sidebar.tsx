import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  ChartBar,
  Certificate,
  IdentificationCard,
  Buildings,
  Clock,
  User,
  Users,
  SignOut,
  FolderUser,
  ShareNetwork,
  Gear,
  Code,
  UserCircle,
  ListChecks,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { ROLE_LABEL } from '@/lib/access'
import { Badge } from '../common/Badge'

export interface SidebarProps {
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()

  if (!currentUser) return null

  const role = currentUser.role

  const getNavItems = () => {
    switch (role) {
      case 'organization':
        return [
          { to: '/org/dashboard', label: 'Dashboard', icon: <ChartBar weight="fill" className="w-5 h-5" /> },
          { to: '/org/details', label: 'Organization Details', icon: <Buildings weight="fill" className="w-5 h-5" /> },
          { to: '/org/managers', label: 'Identity Managers', icon: <Users weight="fill" className="w-5 h-5" /> },
          { to: '/org/identities', label: 'Citizen Directory', icon: <IdentificationCard weight="fill" className="w-5 h-5" /> },
          { to: '/org/credentials', label: 'Credentials', icon: <Certificate weight="fill" className="w-5 h-5" /> },
          { to: '/org/issue', label: 'Issue Credential', icon: <Certificate weight="fill" className="w-5 h-5" /> },
          { to: '/org/activity', label: 'Activity Log', icon: <Clock weight="fill" className="w-5 h-5" /> },
          { to: '/org/profile', label: 'Organization Profile', icon: <UserCircle weight="fill" className="w-5 h-5" /> },
        ]

      case 'identity_manager':
        return [
          { to: '/im/dashboard', label: 'Dashboard', icon: <ChartBar weight="fill" className="w-5 h-5" /> },
          { to: '/im/citizens', label: 'Citizens', icon: <IdentificationCard weight="fill" className="w-5 h-5" /> },
          { to: '/im/identities', label: 'Identity Directory', icon: <UserCircle weight="fill" className="w-5 h-5" /> },
          { to: '/im/create-identity', label: 'Create Identity', icon: <IdentificationCard weight="fill" className="w-5 h-5" /> },
          { to: '/im/review-queue', label: 'Review Queue', icon: <ListChecks weight="fill" className="w-5 h-5" /> },
          { to: '/im/credentials', label: 'Credentials', icon: <Certificate weight="fill" className="w-5 h-5" /> },
          { to: '/im/templates', label: 'Credential Templates', icon: <FolderUser weight="fill" className="w-5 h-5" /> },
          { to: '/im/profile', label: 'Profile', icon: <User weight="fill" className="w-5 h-5" /> },
        ]

      case 'citizen':
        return [
          { to: '/citizen/dashboard', label: 'Dashboard', icon: <ChartBar weight="fill" className="w-5 h-5" /> },
          { to: '/citizen/credential', label: 'My Credential', icon: <Certificate weight="fill" className="w-5 h-5" /> },
          { to: '/citizen/credentials', label: 'Credential List', icon: <Certificate weight="fill" className="w-5 h-5" /> },
          { to: '/citizen/presentations', label: 'Presentations', icon: <ShareNetwork weight="fill" className="w-5 h-5" /> },
          { to: '/citizen/profile', label: 'Profile', icon: <User weight="fill" className="w-5 h-5" /> },
          { to: '/citizen/settings', label: 'Settings', icon: <Gear weight="fill" className="w-5 h-5" /> },
          { to: '/citizen/verification-history', label: 'Verification History', icon: <Clock weight="fill" className="w-5 h-5" /> },
        ]

      case 'administrator':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: <ChartBar weight="fill" className="w-5 h-5" /> },
          { to: '/admin/requests', label: 'Organization Requests', icon: <FolderUser weight="fill" className="w-5 h-5" /> },
          { to: '/admin/organizations', label: 'Organizations', icon: <Buildings weight="fill" className="w-5 h-5" /> },
          { to: '/admin/users', label: 'User Accounts', icon: <Users weight="fill" className="w-5 h-5" /> },
          { to: '/admin/audit', label: 'Audit Logs', icon: <Clock weight="fill" className="w-5 h-5" /> },
          { to: '/admin/settings', label: 'Settings', icon: <Gear weight="fill" className="w-5 h-5" /> },
          { to: '/admin/system-status', label: 'System Status', icon: <ChartBar weight="fill" className="w-5 h-5" /> },
          { to: '/admin/api', label: 'API Reference', icon: <Code weight="fill" className="w-5 h-5" /> },
        ]
    }
  }

  const navItems = getNavItems()

  const handleSignOut = () => {
    logout()
    navigate('/')
    onCloseMobile?.()
  }

  return (
    <aside className="w-64 bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col h-full select-none">
      {/* Brand & Workspace */}
      <div className="p-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck weight="fill" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#0F172A] leading-tight">
              ShieldID Provider
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Decentralized Trust Platform</p>
          </div>
        </div>

        {/* Current Active Role Indicator */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Role
          </span>
          <Badge variant="blue" dot={true}>
            {ROLE_LABEL[role]}
          </Badge>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                  : 'text-[#334155] hover:bg-slate-200/60 hover:text-[#0F172A] font-medium'
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom User Profile & Plain Sign Out */}
      <div className="p-3 border-t border-[#E2E8F0] bg-white">
        <div className="flex items-center gap-2.5 min-w-0 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#0F172A] truncate leading-tight">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors border border-rose-200/60"
        >
          <SignOut weight="bold" className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
