export type Role = 'organization' | 'identity_manager' | 'citizen' | 'administrator'

export type AccountStatus = 'active' | 'invited' | 'inactive' | 'suspended'

export type OrganizationStatus = 'active' | 'inactive' | 'pending'

export type IdentityStatus = 'active' | 'pending_review' | 'rejected' | 'inactive'

export type CredentialStatus = 'issued' | 'revoked' | 'pending'

export type RegistryStatus = 'issued' | 'expired' | 'revoked' | 'pending'

export type VerificationOutcome =
  | 'valid'
  | 'expired'
  | 'revoked'
  | 'invalid'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
  status: AccountStatus
  organizationId?: string
  identityId?: string
  phone?: string
  notificationPreferences?: NotificationPreferences
  createdAt: string
  resetToken?: string
}

export interface NotificationPreferences {
  emailAlerts: boolean
  expiryReminders: boolean
  shareActivity: boolean
}

export interface Organization {
  id: string
  name: string
  legalName?: string
  orgType: string
  email: string
  phone?: string
  website?: string
  address?: string
  description?: string
  did: string
  status: OrganizationStatus
  nominatedImName?: string
  nominatedImEmail?: string
  rejectionReason?: string
  approvedAt?: string
  createdAt: string
}

export interface Identity {
  id: string
  organizationId: string
  createdByUserId?: string
  fullName: string
  email: string
  phone?: string
  dateOfBirth: string
  address?: string
  idReference?: string
  status: IdentityStatus
  did?: string
  createdAt: string
  updatedAt: string
  userId?: string
}

export interface CredentialProof {
  type: string
  created: string
  verificationMethod: string
  proofPurpose: 'assertionMethod'
  proofValue: string
  simulated: boolean
}

export interface Credential {
  id: string
  templateId?: string
  type: string
  title: string
  organizationId: string
  identityId: string
  issuerDid: string
  issuerName: string
  subjectDid: string
  subjectName: string
  claims: Record<string, string>
  issuedAt: string
  expiresAt?: string
  status: CredentialStatus
  proof: CredentialProof | null
  issuedByUserId: string
  issuedByName: string
}

export interface Revocation {
  id: string
  credentialId: string
  organizationId: string
  reason: string
  revokedByUserId: string
  revokedByName: string
  revokedAt: string
}

export interface Check {
  id: string
  label: string
  state: 'pass' | 'fail' | 'warn' | 'skipped'
  detail: string
}

export interface VerificationRecord {
  id: string
  credentialId?: string
  presentationId?: string
  outcome: VerificationOutcome
  summary: string
  verifiedAt: string
  actorUserId?: string
  actorName?: string
  simulated: boolean
  checks: Check[]
}

export interface Presentation {
  id: string
  code: string
  ownerUserId: string
  credentialId: string
  disclosedClaims: string[]
  purpose: string
  createdAt: string
  expiresAt: string
  revokedAt?: string
}

export interface AuditLog {
  id: string
  organizationId?: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId: string
  timestamp: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  createdAt: string
  read: boolean
}

export interface Settings {
  defaultOrganizationId: string
  requireReviewForRegistration: boolean
  supportEmail: string
}

export interface AppState {
  version: number
  users: User[]
  organizations: Organization[]
  identities: Identity[]
  credentials: Credential[]
  revocations: Revocation[]
  verifications: VerificationRecord[]
  presentations: Presentation[]
  audits: AuditLog[]
  notifications: Notification[]
  settings: Settings
  sessionUserId: string | null
}

export type FieldInput = 'text' | 'date' | 'select'

export interface TemplateField {
  key: string
  label: string
  required: boolean
  input?: FieldInput
  options?: string[]
  hint?: string
}

export interface CredentialTemplate {
  id: string
  name: string
  type: string
  description: string
  fields: TemplateField[]
}

export type Result<T> = { ok: true; data: T } | { ok: false; message: string }
