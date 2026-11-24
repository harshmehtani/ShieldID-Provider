import type { Credential, Identity, RegistryStatus } from '@/types'
import { isPastDay } from '@/lib/dates'

export function registryStatus(credential: Credential, now = new Date()): RegistryStatus {
  if (credential.status === 'pending') return 'pending'
  if (credential.status === 'revoked') return 'revoked'
  if (credential.expiresAt && isPastDay(credential.expiresAt, now)) return 'expired'
  return 'issued'
}

export function didMethod(did: string) {
  if (did.startsWith('did:web:')) return 'did:web'
  if (did.startsWith('did:key:')) return 'did:key'
  return 'unknown'
}

export function didDocument(did: string) {
  const fragment = `${did}#key-1`
  const publicKeyMultibase = did.startsWith('did:key:')
    ? did.slice('did:key:'.length)
    : `z6MkdemoPublic${did.split(':').at(-1) ?? 'issuer'}`

  return {
    '@context': ['https://www.w3.org/ns/did/v1'],
    id: did,
    verificationMethod: [
      {
        id: fragment,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase,
      },
    ],
    authentication: [fragment],
    assertionMethod: [fragment],
  }
}

export function buildCredentialJson(credential: Credential) {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.org',
    ],
    id: `urn:shieldid:demo:${credential.id}`,
    type: ['VerifiableCredential', credential.type],
    issuer: {
      id: credential.issuerDid,
      name: credential.issuerName,
    },
    issuanceDate: credential.issuedAt,
    ...(credential.expiresAt ? { expirationDate: credential.expiresAt } : {}),
    credentialSubject: {
      id: credential.subjectDid,
      ...credential.claims,
    },
    credentialStatus: {
      registryStatus: registryStatus(credential),
      prototype: true,
    },
    proof: credential.proof
      ? {
          ...credential.proof,
          note: 'Simulated proof value. This is not a cryptographic signature.',
        }
      : null,
  }
}

export function simulatedProof(credentialId: string, issuerDid: string, created: string) {
  return {
    type: 'Ed25519Signature2020',
    created,
    verificationMethod: `${issuerDid}#key-1`,
    proofPurpose: 'assertionMethod' as const,
    proofValue: `uSIMULATED_${credentialId}_NOT_A_SIGNATURE`,
    simulated: true as const,
  }
}

export function subjectDid(identity: Identity) {
  return identity.did ?? ''
}
