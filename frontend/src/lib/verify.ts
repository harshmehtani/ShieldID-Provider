import type { Check, Credential, VerificationOutcome } from '@/types'
import { isPastDay } from '@/lib/dates'

export interface Evaluation {
  outcome: VerificationOutcome
  summary: string
  checks: Check[]
}

export function evaluateCredentialJson(parsed: Record<string, any>): Evaluation {
  const checks: Check[] = []

  // Check 1: Structure & Context
  const hasContext = Array.isArray(parsed['@context']) && parsed['@context'].length > 0
  const hasType = Boolean(parsed.type)
  const hasIssuer = Boolean(parsed.issuer?.id || parsed.issuer)
  const hasSubject = Boolean(parsed.credentialSubject?.id || parsed.credentialSubject)

  const structureOk = hasContext && hasType && hasIssuer && hasSubject
  checks.push({
    id: 'structure',
    label: 'Credential Schema & Structure',
    state: structureOk ? 'pass' : 'fail',
    detail: structureOk
      ? 'Required context, type, issuer, and subject fields are present.'
      : 'Malformed credential structure: missing required @context, issuer, or credentialSubject.',
  })

  // Check 2: Expiration
  const expStr = parsed.expirationDate || parsed.expiresAt
  const isExpired = expStr ? isPastDay(expStr) : false
  checks.push({
    id: 'expiration',
    label: 'Expiration Check',
    state: isExpired ? 'fail' : 'pass',
    detail: expStr
      ? isExpired
        ? `Credential expired on ${expStr}.`
        : `Credential valid through ${expStr}.`
      : 'No expiration date is declared in this file.',
  })

  // Check 3: Revocation Status
  const statusObj = parsed.credentialStatus
  const isRevoked = statusObj?.status === 'revoked' || statusObj?.registryStatus === 'revoked'
  checks.push({
    id: 'revocation',
    label: 'Issuer Revocation Status',
    state: isRevoked ? 'fail' : 'pass',
    detail: isRevoked
      ? 'Credential has been permanently revoked by the issuing institution.'
      : 'This file does not declare a revoked status. No live issuer registry was checked.',
  })

  // Check 4: Cryptographic Proof
  const proof = parsed.proof
  const hasProof = Boolean(proof && (proof.proofValue || proof.jws))
  checks.push({
    id: 'proof',
    label: 'Proof field present (not signature-verified)',
    state: hasProof ? 'pass' : 'fail',
    detail: hasProof
      ? `A proof field (${proof.type || 'type not specified'}) is present. Its signature was not verified.`
      : 'No proof field was found in the credential file.',
  })

  let outcome: VerificationOutcome = 'valid'
  let summary = 'The file passed the prototype checks. Authenticity has not been established.'

  if (!structureOk || !hasProof) {
    outcome = 'invalid'
    summary = 'The file is missing required fields or a proof field. No signature verification was performed.'
  } else if (isRevoked) {
    outcome = 'revoked'
    summary = 'The uploaded file declares a revoked status.'
  } else if (isExpired) {
    outcome = 'expired'
    summary = 'The declared expiration date has passed.'
  }

  return {
    outcome,
    summary,
    checks,
  }
}
