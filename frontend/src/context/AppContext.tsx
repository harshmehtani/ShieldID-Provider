import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import type {
  AppState,
  Credential,
  Identity,
  Notification,
  NotificationPreferences,
  Organization,
  Presentation,
  Role,
  Settings,
  User,
  VerificationRecord,
} from '@/types'
import { createSeed, STATE_VERSION } from '@/data/seed'
import { evaluateCredentialJson, type Evaluation } from '@/lib/verify'
import { buildCredentialJson, registryStatus, simulatedProof } from '@/lib/credential'
import { makeDid, uid } from '@/lib/ids'

export interface ToastItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

interface AppContextType {
  state: AppState
  currentUser: User | null
  toasts: ToastItem[]
  showToast: (type: ToastItem['type'], title: string, message?: string) => void
  removeToast: (id: string) => void

  // Auth
  login: (email: string, password?: string) => { success: boolean; role?: Role; message?: string }
  logout: () => void

  // Organization registration & admin review
  registerOrganization: (data: {
    name: string
    orgType: string
    email: string
    password: string
    nominatedImName: string
    nominatedImEmail: string
  }) => { ok: boolean; message?: string }
  approveOrganization: (orgId: string) => { ok: boolean; tempPassword?: string }
  rejectOrganization: (orgId: string, reason: string) => void
  removeOrganization: (orgId: string) => { ok: boolean; message?: string }

  // Identity Manager management
  inviteIdentityManager: (data: {
    organizationId: string
    name: string
    email: string
  }) => { ok: boolean; tempPassword?: string; message?: string }
  deactivateIdentityManager: (userId: string) => void
  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void

  // Citizen registration (Identity Manager only)
  createIdentity: (data: {
    organizationId: string
    fullName: string
    email: string
    dateOfBirth: string
    phone?: string
    address?: string
    idReference?: string
    did?: string
  }) => Identity

  // Credential issuance & revocation (Identity Manager only)
  issueCredential: (data: {
    organizationId: string
    identityId: string
    issuedByUserId: string
    issuedByName: string
    type: string
    title: string
    claims: Record<string, string>
    expiresAt?: string
    templateId?: string
  }) => { ok: true; credential: Credential } | { ok: false; message: string }
  revokeCredential: (credentialId: string, reason: string) => void
  inviteUser: (data: { name: string; email: string; role: Role; organizationId?: string; phone?: string }) => void
  updateUserStatus: (userId: string, status: User['status']) => void
  updateUserSettings: (settings: Settings) => void
  updateUserProfile: (data: { phone: string }) => void
  updateCitizenPreferences: (preferences: NotificationPreferences) => void
  resetDemoData: () => void
  registerCitizen: (data: { fullName: string; email: string; phone: string; dateOfBirth: string; address: string; idReference: string }) => { success: boolean; message?: string }
  reviewIdentity: (identityId: string, status: 'active' | 'rejected', note: string) => void
  createPresentation: (data: { credentialId: string; disclosedClaims: string[]; purpose: string; durationHours: number }) => Presentation | null
  revokePresentation: (presentationId: string) => void
  verifyCredentialInput: (input: { credentialId?: string; presentationCode?: string; rawJson?: string }) => Evaluation & { credential?: Credential | null; verificationId: string }
}

const STORAGE_KEY = 'shieldid_state_v2'

function generateTempPassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function formatDobPassword(dobString: string): string {
  // expects 'YYYY-MM-DD' -> returns 'DDMMYYYY'
  const parts = dobString.split('-')
  if (parts.length === 3) {
    const [year, month, day] = parts
    return `${day.padStart(2, '0')}${month.padStart(2, '0')}${year}`
  }
  return dobString.replace(/\D/g, '')
}

const AppContext = createContext<AppContextType | null>(null)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AppState
        if (parsed.version === STATE_VERSION && parsed.users?.length) {
          return parsed
        }
      }
    } catch (e) {
      console.warn('Failed to restore stored state, using seed:', e)
    }
    return createSeed()
  })

  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (err) {
      console.error('Failed to save state to localStorage:', err)
    }
  }, [state])

  const showToast = useCallback((type: ToastItem['type'], title: string, message?: string) => {
    const id = uid('toast')
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 6000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const currentUser = useMemo(() => {
    if (!state.sessionUserId) return null
    return state.users.find((u) => u.id === state.sessionUserId) ?? null
  }, [state.sessionUserId, state.users])

  const login = useCallback(
    (email: string, password?: string) => {
      const cleanEmail = email.toLowerCase().trim()
      const user = state.users.find((u) => u.email.toLowerCase() === cleanEmail)

      if (!user) {
        return { success: false, message: 'Invalid credentials. User not found.' }
      }

      if (user.status === 'inactive' || user.status === 'suspended') {
        return { success: false, message: 'This account has been deactivated or suspended.' }
      }

      // Check organization status if user belongs to one
      if (user.organizationId) {
        const org = state.organizations.find((o) => o.id === user.organizationId)
        if (org && org.status === 'inactive' && !(user.role === 'organization' && org.rejectionReason)) {
          return { success: false, message: 'The organization associated with this account is inactive.' }
        }
        if (org && org.status === 'pending' && user.role !== 'organization') {
          return { success: false, message: 'This account becomes available after the organization is approved.' }
        }
      }

      if (password && user.password && user.password !== password) {
        return { success: false, message: 'Invalid credentials. Please verify your password.' }
      }

      setState((prev) => ({
        ...prev,
        users: prev.users.map((entry) => entry.id === user.id && entry.status === 'invited'
          ? { ...entry, status: 'active' }
          : entry),
        sessionUserId: user.id,
      }))

      showToast('success', `Signed in as ${user.name}`, `Role: ${user.role.replace('_', ' ')}`)
      return { success: true, role: user.role }
    },
    [state.users, state.organizations, showToast],
  )

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, sessionUserId: null }))
  }, [])

  const registerOrganization = useCallback(
    (data: {
      name: string
      orgType: string
      email: string
      password: string
      nominatedImName: string
      nominatedImEmail: string
    }) => {
      const existing = state.organizations.find((o) => o.email.toLowerCase() === data.email.toLowerCase().trim())
      if (existing) {
        return { ok: false, message: 'An organization with this official email already exists.' }
      }

      const orgId = uid('org')
      const userId = uid('usr-org')
      const now = new Date().toISOString()

      const newOrg: Organization = {
        id: orgId,
        name: data.name,
        orgType: data.orgType,
        email: data.email.trim(),
        did: '',
        status: 'pending',
        nominatedImName: data.nominatedImName.trim(),
        nominatedImEmail: data.nominatedImEmail.trim(),
        createdAt: now,
      }

      // Create primary organization login account
      const newOrgUser: User = {
        id: userId,
        name: data.name,
        email: data.email.trim(),
        password: data.password,
        role: 'organization',
        status: 'active',
        organizationId: orgId,
        createdAt: now,
      }

      setState((prev) => ({
        ...prev,
        organizations: [newOrg, ...prev.organizations],
        users: [...prev.users, newOrgUser],
        audits: [
          {
            id: uid('aud'),
            organizationId: orgId,
            userId,
            userName: data.name,
            action: 'REGISTER_ORGANIZATION_APPLICATION',
            resource: 'Organization',
            resourceId: orgId,
            timestamp: now,
          },
          ...prev.audits,
        ],
      }))

      return { ok: true }
    },
    [state.organizations],
  )

  const approveOrganization = useCallback(
    (orgId: string) => {
      const org = state.organizations.find((o) => o.id === orgId)
      if (!org) return { ok: false }

      const generatedDid = makeDid()
      const now = new Date().toISOString()

      setState((prev) => ({
        ...prev,
        organizations: prev.organizations.map((o) =>
          o.id === orgId ? { ...o, status: 'active', did: generatedDid, approvedAt: now } : o,
        ),
        audits: [
          {
            id: uid('aud'),
            organizationId: orgId,
            userId: prev.sessionUserId || 'usr-admin',
            userName: 'System Administrator',
            action: 'APPROVE_ORGANIZATION',
            resource: 'Organization',
            resourceId: orgId,
            timestamp: now,
          },
          ...prev.audits,
        ],
      }))

      showToast(
        'success',
        `Organization "${org.name}" Approved`,
        'The organization can now invite its nominated Identity Manager.',
      )

      return { ok: true }
    },
    [state.organizations, showToast],
  )

  const rejectOrganization = useCallback(
    (orgId: string, reason: string) => {
      const now = new Date().toISOString()
      setState((prev) => ({
        ...prev,
        organizations: prev.organizations.map((o) =>
          o.id === orgId ? { ...o, status: 'inactive', rejectionReason: reason } : o,
        ),
        audits: [
          {
            id: uid('aud'),
            organizationId: orgId,
            userId: prev.sessionUserId || 'usr-admin',
            userName: 'System Administrator',
            action: 'REJECT_ORGANIZATION',
            resource: 'Organization',
            resourceId: orgId,
            timestamp: now,
          },
          ...prev.audits,
        ],
      }))
      showToast('info', 'Organization Application Rejected', reason)
    },
    [showToast],
  )

  const removeOrganization = useCallback((orgId: string) => {
    const organization = state.organizations.find((entry) => entry.id === orgId)
    if (!organization) return { ok: false, message: 'Organization not found.' }

    const removedUsers = state.users.filter((user) => user.organizationId === orgId)
    const removedUserIds = new Set(removedUsers.map((user) => user.id))
    const removedIdentityIds = new Set(state.identities.filter((identity) => identity.organizationId === orgId).map((identity) => identity.id))
    const removedCredentialIds = new Set(state.credentials.filter((credential) => credential.organizationId === orgId).map((credential) => credential.id))
    const now = new Date().toISOString()

    setState((prev) => ({
      ...prev,
      organizations: prev.organizations.filter((entry) => entry.id !== orgId),
      users: prev.users.filter((user) => user.organizationId !== orgId),
      identities: prev.identities.filter((identity) => identity.organizationId !== orgId),
      credentials: prev.credentials.filter((credential) => credential.organizationId !== orgId),
      revocations: prev.revocations.filter((revocation) => revocation.organizationId !== orgId),
      verifications: prev.verifications.filter((record) => !record.credentialId || !removedCredentialIds.has(record.credentialId)),
      presentations: prev.presentations.filter((presentation) =>
        !removedCredentialIds.has(presentation.credentialId) && !removedUserIds.has(presentation.ownerUserId),
      ),
      notifications: prev.notifications.filter((notification) => !removedUserIds.has(notification.userId)),
      audits: [
        {
          id: uid('aud'),
          userId: prev.sessionUserId || 'usr-admin',
          userName: prev.users.find((user) => user.id === prev.sessionUserId)?.name || 'System Administrator',
          action: 'REMOVE_ORGANIZATION',
          resource: 'Organization',
          resourceId: orgId,
          timestamp: now,
        },
        ...prev.audits,
      ],
    }))

    showToast('success', 'Organization removed', `${organization.name} and its linked demo records were removed.`)
    return { ok: true }
  }, [state.organizations, state.users, state.identities, state.credentials, showToast])

  const inviteIdentityManager = useCallback(
    (data: { organizationId: string; name: string; email: string }) => {
      const organization = state.organizations.find((org) => org.id === data.organizationId)
      if (!organization || organization.status !== 'active') {
        return { ok: false, message: 'Only an approved organization can invite Identity Managers.' }
      }

      const cleanEmail = data.email.toLowerCase().trim()
      const existing = state.users.find((u) => u.email.toLowerCase() === cleanEmail)
      if (existing) {
        return { ok: false, message: 'A user account with this email address already exists.' }
      }

      const tempPassword = generateTempPassword()
      const userId = uid('usr-im')
      const now = new Date().toISOString()

      const newIm: User = {
        id: userId,
        name: data.name.trim(),
        email: cleanEmail,
        password: tempPassword,
        role: 'identity_manager',
        status: 'invited',
        organizationId: data.organizationId,
        createdAt: now,
      }

      setState((prev) => ({
        ...prev,
        users: [...prev.users, newIm],
        audits: [
          {
            id: uid('aud'),
            organizationId: data.organizationId,
            userId: prev.sessionUserId || 'sys',
            userName: prev.users.find((u) => u.id === prev.sessionUserId)?.name || 'Organization Admin',
            action: 'INVITE_IDENTITY_MANAGER',
            resource: 'User',
            resourceId: userId,
            timestamp: now,
          },
          ...prev.audits,
        ],
      }))

      showToast('success', 'Identity Manager Added', `Credentials generated for ${data.name}.`)
      return { ok: true, tempPassword }
    },
    [state.users, state.organizations, showToast],
  )

  const deactivateIdentityManager = useCallback(
    (userId: string) => {
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, status: 'inactive' } : u)),
        audits: [
          {
            id: uid('aud'),
            userId: prev.sessionUserId || 'sys',
            userName: prev.users.find((u) => u.id === prev.sessionUserId)?.name || 'Organization Admin',
            action: 'DEACTIVATE_IDENTITY_MANAGER',
            resource: 'User',
            resourceId: userId,
            timestamp: new Date().toISOString(),
          },
          ...prev.audits,
        ],
      }))
      showToast('warning', 'Identity Manager Deactivated', 'The user can no longer sign in.')
    },
    [showToast],
  )

  const createIdentity = useCallback(
    (data: { organizationId: string; fullName: string; email: string; dateOfBirth: string; phone?: string; address?: string; idReference?: string; did?: string }) => {
      const identityId = uid('idn')
      const citizenUserId = uid('usr-cit')
      const citizenDid = makeDid()
      const initialPassword = formatDobPassword(data.dateOfBirth)
      const now = new Date().toISOString()

      const organization = state.organizations.find((org) => org.id === data.organizationId)
      if (!organization || organization.status !== 'active') {
        throw new Error('Only an approved organization can register citizens.')
      }
      const cleanEmail = data.email.toLowerCase().trim()
      if (state.users.some((user) => user.email.toLowerCase() === cleanEmail)) {
        throw new Error('An account with this email address already exists.')
      }

      const identity: Identity = {
        id: identityId,
        organizationId: data.organizationId,
        createdByUserId: state.sessionUserId || '',
        fullName: data.fullName.trim(),
        email: cleanEmail,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        idReference: data.idReference,
        status: 'active',
        did: data.did || citizenDid,
        createdAt: now,
        updatedAt: now,
        userId: citizenUserId,
      }

      const citizenUser: User = {
        id: citizenUserId,
        name: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        password: initialPassword,
        role: 'citizen',
        status: 'active',
        organizationId: data.organizationId,
        identityId: identityId,
        createdAt: now,
      }

      setState((prev) => ({
        ...prev,
        identities: [identity, ...prev.identities],
        users: [...prev.users, citizenUser],
        audits: [
          {
            id: uid('aud'),
            organizationId: data.organizationId,
            userId: prev.sessionUserId || 'sys',
            userName: prev.users.find((u) => u.id === prev.sessionUserId)?.name || 'Identity Manager',
            action: 'REGISTER_CITIZEN',
            resource: 'Identity',
            resourceId: identityId,
            timestamp: now,
          },
          ...prev.audits,
        ],
      }))

      showToast('success', 'Citizen Registered', `Citizen ${data.fullName} registered with DID ${citizenDid}`)
      return identity
    },
    [showToast, state.sessionUserId, state.users, state.organizations],
  )

  const issueCredential = useCallback(
    (data: {
      organizationId: string
      identityId: string
      issuedByUserId: string
      issuedByName: string
      type: string
      title: string
      claims: Record<string, string>
      expiresAt?: string
      templateId?: string
    }): { ok: true; credential: Credential } | { ok: false; message: string } => {
      // STRICT PRD RULE: Exactly ONE credential per citizen — ever (no renewal, no replacement)
      const existingCred = state.credentials.find((c) => c.identityId === data.identityId)
      if (existingCred) {
        return {
          ok: false,
          message: 'Policy Violation: This citizen has already received a credential. Under system rules, each citizen is eligible for exactly one credential.',
        }
      }

      const identity = state.identities.find((i) => i.id === data.identityId && i.organizationId === data.organizationId)
      const organization = state.organizations.find((o) => o.id === data.organizationId)

      if (!organization || organization.status !== 'active') {
        return { ok: false, message: 'Only an approved organization can issue credentials.' }
      }

      if (!identity || !identity.did) {
        return { ok: false, message: 'Citizen identity record or DID not found.' }
      }

      if (!organization || !organization.did) {
        return { ok: false, message: 'Issuing organization record or DID not found.' }
      }

      const credId = uid('cred')
      const now = new Date().toISOString()
      const proof = simulatedProof(credId, organization.did, now)

      const credential: Credential = {
        id: credId,
        templateId: data.templateId,
        type: data.type,
        title: data.title,
        organizationId: data.organizationId,
        identityId: data.identityId,
        issuerDid: organization.did,
        issuerName: organization.name,
        subjectDid: identity.did,
        subjectName: identity.fullName,
        claims: data.claims,
        issuedAt: now,
        expiresAt: data.expiresAt,
        status: 'issued',
        proof,
        issuedByUserId: data.issuedByUserId,
        issuedByName: data.issuedByName,
      }

      setState((prev) => ({
        ...prev,
        credentials: [credential, ...prev.credentials],
        audits: [
          {
            id: uid('aud'),
            organizationId: data.organizationId,
            userId: data.issuedByUserId,
            userName: data.issuedByName,
            action: 'ISSUE_CREDENTIAL',
            resource: 'Credential',
            resourceId: credId,
            timestamp: now,
          },
          ...prev.audits,
        ],
      }))

      showToast('success', 'Credential Issued', `${data.title} issued for ${identity.fullName}`)
      return { ok: true, credential }
    },
    [state.credentials, state.identities, state.organizations, showToast],
  )

  const markNotificationRead = useCallback((notificationId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) =>
        notification.id === notificationId &&
        (notification.userId === currentUser?.id || !notification.userId)
          ? { ...notification, read: true }
          : notification,
      ),
    }))
  }, [currentUser?.id])

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) =>
        notification.userId === currentUser?.id || !notification.userId
          ? { ...notification, read: true }
          : notification,
      ),
    }))
  }, [currentUser?.id])

  const revokeCredential = useCallback(
    (credentialId: string, reason: string) => {
      const cred = state.credentials.find((c) => c.id === credentialId)
      if (!cred) return

      const now = new Date().toISOString()
      const user = currentUser

      setState((prev) => ({
        ...prev,
        credentials: prev.credentials.map((c) =>
          c.id === credentialId ? { ...c, status: 'revoked' } : c,
        ),
        revocations: [
          {
            id: uid('rev'),
            credentialId,
            organizationId: cred.organizationId,
            reason,
            revokedByUserId: user?.id || 'sys',
            revokedByName: user?.name || 'Identity Manager',
            revokedAt: now,
          },
          ...prev.revocations,
        ],
        audits: [
          {
            id: uid('aud'),
            organizationId: cred.organizationId,
            userId: user?.id || 'sys',
            userName: user?.name || 'Identity Manager',
            action: 'REVOKE_CREDENTIAL',
            resource: 'Credential',
            resourceId: credentialId,
            timestamp: now,
          },
          ...prev.audits,
        ],
      }))

      showToast('error', 'Credential Revoked', `Credential ${credentialId} has been revoked permanently.`)
    },
    [state.credentials, currentUser, showToast],
  )

  const inviteUser = useCallback((data: { name: string; email: string; role: Role; organizationId?: string; phone?: string }) => {
    if (data.role === 'identity_manager') {
      showToast('error', 'Identity manager not added', 'An organization must invite its own identity managers.')
      return
    }
    const email = data.email.trim().toLowerCase()
    if (state.users.some((user) => user.email.toLowerCase() === email)) {
      showToast('error', 'Invitation not created', 'A user with this email already exists.')
      return
    }
    const now = new Date().toISOString()
    const user: User = {
      id: uid('usr'),
      name: data.name.trim(),
      email,
      password: generateTempPassword(),
      role: data.role,
      status: 'invited',
      organizationId: data.organizationId,
      phone: data.phone?.trim(),
      createdAt: now,
    }
    setState((prev) => ({
      ...prev,
      users: [...prev.users, user],
      audits: [{
        id: uid('aud'), organizationId: data.organizationId, userId: prev.sessionUserId || 'sys',
        userName: prev.users.find((entry) => entry.id === prev.sessionUserId)?.name || 'System Administrator',
        action: 'INVITE_USER', resource: 'User', resourceId: user.id, timestamp: now,
      }, ...prev.audits],
    }))
    showToast('success', 'Invitation created', `A demo account was created for ${user.name}.`)
  }, [state.users, showToast])

  const updateUserStatus = useCallback((userId: string, status: User['status']) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === userId ? { ...user, status } : user),
    }))
  }, [])

  const updateUserSettings = useCallback((settings: Settings) => {
    setState((prev) => ({ ...prev, settings }))
    showToast('success', 'Demo settings saved', 'These settings are stored in this browser only.')
  }, [showToast])

  const updateUserProfile = useCallback((data: { phone: string }) => {
    if (!currentUser) return
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === currentUser.id ? { ...user, phone: data.phone.trim() } : user),
    }))
    showToast('success', 'Profile saved', 'Contact details are saved in this browser demo.')
  }, [currentUser, showToast])

  const updateCitizenPreferences = useCallback((preferences: NotificationPreferences) => {
    if (!currentUser) return
    setState((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === currentUser.id ? { ...user, notificationPreferences: preferences } : user),
    }))
    showToast('success', 'Preferences saved', 'Preferences are saved in this browser demo.')
  }, [currentUser, showToast])

  const resetDemoData = useCallback(() => {
    setState(createSeed())
    showToast('success', 'Demo data restored', 'The sample data has been reset in this browser.')
  }, [showToast])

  const registerCitizen = useCallback((data: { fullName: string; email: string; phone: string; dateOfBirth: string; address: string; idReference: string }) => {
    try {
      createIdentity({
        organizationId: state.settings.defaultOrganizationId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        idReference: data.idReference,
      })
      return { success: true }
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Registration failed.' }
    }
  }, [createIdentity, state.settings.defaultOrganizationId])

  const reviewIdentity = useCallback((identityId: string, status: 'active' | 'rejected', note: string) => {
    const now = new Date().toISOString()
    setState((prev) => ({
      ...prev,
      identities: prev.identities.map((identity) => identity.id === identityId
        ? { ...identity, status, did: status === 'active' ? identity.did || makeDid() : identity.did, updatedAt: now }
        : identity),
      audits: [{
        id: uid('aud'), userId: prev.sessionUserId || 'sys',
        userName: prev.users.find((user) => user.id === prev.sessionUserId)?.name || 'Identity Manager',
        action: status === 'active' ? 'APPROVE_IDENTITY' : 'REJECT_IDENTITY', resource: 'Identity', resourceId: identityId, timestamp: now,
      }, ...prev.audits],
    }))
    showToast(status === 'active' ? 'success' : 'warning', status === 'active' ? 'Identity approved' : 'Identity rejected', note.trim() || undefined)
  }, [showToast])

  const createPresentation = useCallback((data: { credentialId: string; disclosedClaims: string[]; purpose: string; durationHours: number }) => {
    const credential = state.credentials.find((entry) => entry.id === data.credentialId)
    if (!credential || !currentUser) return null
    const now = new Date()
    const expiresAt = new Date(now.getTime() + data.durationHours * 60 * 60 * 1000).toISOString()
    const presentation: Presentation = {
      id: uid('pres'), code: uid('share'), ownerUserId: currentUser.id, credentialId: data.credentialId,
      disclosedClaims: data.disclosedClaims, purpose: data.purpose.trim(), createdAt: now.toISOString(), expiresAt,
    }
    setState((prev) => ({ ...prev, presentations: [presentation, ...prev.presentations] }))
    showToast('success', 'Demo share created', 'The share code is stored locally and is not published to a verifier service.')
    return presentation
  }, [state.credentials, currentUser, showToast])

  const revokePresentation = useCallback((presentationId: string) => {
    const revokedAt = new Date().toISOString()
    setState((prev) => ({
      ...prev,
      presentations: prev.presentations.map((item) => item.id === presentationId ? { ...item, revokedAt } : item),
    }))
  }, [])

  const verifyCredentialInput = useCallback((input: { credentialId?: string; presentationCode?: string; rawJson?: string }) => {
    const presentation = input.presentationCode
      ? state.presentations.find((item) => item.code === input.presentationCode)
      : undefined
    const credential = input.credentialId
      ? state.credentials.find((item) => item.id === input.credentialId) || null
      : presentation
        ? state.credentials.find((item) => item.id === presentation.credentialId) || null
        : null
    let evaluation: Evaluation
    if (input.rawJson) {
      try {
        const parsed = JSON.parse(input.rawJson)
        evaluation = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? evaluateCredentialJson(parsed)
          : evaluateCredentialJson({})
      } catch {
        evaluation = evaluateCredentialJson({})
      }
    } else if (credential) {
      evaluation = evaluateCredentialJson(buildCredentialJson(credential))
    } else {
      evaluation = evaluateCredentialJson({})
    }
    if (presentation?.revokedAt) {
      evaluation = { ...evaluation, outcome: 'revoked', summary: 'This demo presentation has been revoked locally.' }
    } else if (presentation && new Date(presentation.expiresAt).getTime() < Date.now()) {
      evaluation = { ...evaluation, outcome: 'expired', summary: 'This demo presentation has expired.' }
    } else if (credential && registryStatus(credential) === 'revoked') {
      evaluation = { ...evaluation, outcome: 'revoked', summary: 'The local demo record is marked revoked.' }
    }

    const verificationId = uid('ver')
    const record: VerificationRecord = {
      id: verificationId, credentialId: credential?.id, presentationId: presentation?.id,
      outcome: evaluation.outcome, summary: evaluation.summary, verifiedAt: new Date().toISOString(),
      actorUserId: currentUser?.id, actorName: currentUser?.name, simulated: true, checks: evaluation.checks,
    }
    setState((prev) => ({ ...prev, verifications: [record, ...prev.verifications] }))
    return { ...evaluation, credential, verificationId }
  }, [state.presentations, state.credentials, currentUser])

  return (
    <AppContext.Provider
      value={{
        state,
        currentUser,
        toasts,
        showToast,
        removeToast,
        login,
        logout,
        registerOrganization,
        approveOrganization,
        rejectOrganization,
        removeOrganization,
        inviteIdentityManager,
        deactivateIdentityManager,
        markNotificationRead,
        markAllNotificationsRead,
        createIdentity,
        issueCredential,
        revokeCredential,
        inviteUser,
        updateUserStatus,
        updateUserSettings,
        updateUserProfile,
        updateCitizenPreferences,
        resetDemoData,
        registerCitizen,
        reviewIdentity,
        createPresentation,
        revokePresentation,
        verifyCredentialInput,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextType {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
