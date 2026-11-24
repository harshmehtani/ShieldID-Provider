import type { Credential, Role } from '@/types'

/** Draft frontend contracts derived from the ShieldID MVP workflow. */
export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
  status: string
  organizationId?: string
  identityId?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: 'bearer'
  user: SessionUser
}

export interface OrganizationRegistrationRequest {
  name: string
  orgType: string
  email: string
  password: string
  nominatedImName: string
  nominatedImEmail: string
}

export interface OrganizationApplicationResponse {
  id: string
  name: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  createdAt: string
}

export interface CreateCitizenRequest {
  fullName: string
  email: string
  dateOfBirth: string
}

export interface IssueCredentialRequest {
  citizenId: string
  category: 'IdentityCredential' | 'EducationCredential' | 'EmploymentCredential'
  claims: Record<string, string>
  expiresAt?: string
}

export interface IssueCredentialResponse {
  credential: Credential
}

export interface VerifyCredentialResponse {
  outcome: 'valid' | 'invalid' | 'expired' | 'revoked'
  summary: string
  checks: Array<{ id: string; label: string; state: 'pass' | 'fail' | 'warn'; detail: string }>
  credential?: Credential
}
