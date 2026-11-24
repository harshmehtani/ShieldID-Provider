import type { Role } from '@/types'

export const ROLE_LABEL: Record<Role, string> = {
  organization: 'Organization',
  identity_manager: 'Identity Manager',
  citizen: 'Citizen',
  administrator: 'System Administrator',
}

export function homeFor(role: Role): string {
  switch (role) {
    case 'organization':
      return '/org/dashboard'
    case 'identity_manager':
      return '/im/dashboard'
    case 'citizen':
      return '/citizen/dashboard'
    case 'administrator':
      return '/admin/dashboard'
  }
}

export function loginFor(role: Role): string {
  switch (role) {
    case 'organization':
      return '/org/login'
    case 'identity_manager':
      return '/im/login'
    case 'citizen':
      return '/citizen/login'
    case 'administrator':
      return '/admin/login'
  }
}
