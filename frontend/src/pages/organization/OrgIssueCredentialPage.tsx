import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Certificate,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Eye,
  User,
  ShieldCheck,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { TEMPLATES } from '@/data/templates'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Badge } from '@/components/common/Badge'
import { JsonViewer } from '@/components/common/JsonViewer'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'

export const OrgIssueCredentialPage: React.FC = () => {
  const { state, currentUser, issueCredential } = useApp()
  const navigate = useNavigate()

  const orgId = currentUser?.organizationId || state.organizations[0]?.id
  const organizationIdentities = state.identities.filter((identity) => identity.organizationId === orgId)

  // Form states
  const [selectedIdentityId, setSelectedIdentityId] = useState(organizationIdentities[0]?.id || '')
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0].id)
  const [claims, setClaims] = useState<Record<string, string>>({})
  const [expiresAt, setExpiresAt] = useState('2028-12-31')
  const [previewMode, setPreviewMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [issuedId, setIssuedId] = useState<string | null>(null)

  const selectedTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0]
  const selectedIdentity = organizationIdentities.find((i) => i.id === selectedIdentityId)

  // Initialize default claims when template or identity changes
  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplateId(tmplId)
    const tmpl = TEMPLATES.find((t) => t.id === tmplId)
    if (!tmpl) return

    const initial: Record<string, string> = {}
    if (tmpl.id === 'tpl_identity' && selectedIdentity) {
      initial.fullName = selectedIdentity.fullName
      initial.dateOfBirth = selectedIdentity.dateOfBirth
      initial.documentType = 'Internal record'
      initial.documentReference = selectedIdentity.idReference || ''
      initial.residency = 'Harbor Municipal District'
    } else if (tmpl.id === 'tpl_education' && selectedIdentity) {
      initial.institution = 'Harbor Technical Institute'
      initial.qualification = 'Bachelor of Information Systems'
      initial.fieldOfStudy = 'Decentralized Architecture'
      initial.yearAwarded = '2024'
      initial.grade = 'Distinction'
    } else if (tmpl.id === 'tpl_employment' && selectedIdentity) {
      initial.employer = 'Harbor Port Operations Ltd'
      initial.jobTitle = 'Senior Identity Systems Specialist'
      initial.employmentType = 'Full-time'
      initial.startDate = '2025-01-01'
    }
    setClaims(initial)
  }

  // Sync initial claims on mount
  React.useEffect(() => {
    handleTemplateChange(selectedTemplateId)
  }, [selectedIdentityId])

  const handleClaimChange = (key: string, val: string) => {
    setClaims((prev) => ({ ...prev, [key]: val }))
  }

  const handleIssue = () => {
    setError(null)
    // Validate required fields
    for (const field of selectedTemplate.fields) {
      if (field.required && !claims[field.key]) {
        setError(`Please provide a value for required claim: ${field.label}`)
        return
      }
    }

    if (!selectedIdentityId || !orgId) {
      setError('Please select a citizen identity holder.')
      return
    }

    const result = issueCredential({
      templateId: selectedTemplate.id,
      type: selectedTemplate.type,
      title: `${selectedTemplate.name} for ${selectedIdentity?.fullName || 'Citizen'}`,
      organizationId: orgId,
      identityId: selectedIdentityId,
      issuedByUserId: currentUser?.id || 'demo-issuer',
      issuedByName: currentUser?.name || 'Demo Issuer',
      claims,
      ...(expiresAt ? { expiresAt: `${expiresAt}T23:59:59.000Z` } : {}),
    })

    if (result.ok) setIssuedId(result.credential.id)
    else setError(result.message)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Issue Verifiable Credential
          </h1>
          <p className="text-sm text-slate-500">
            Create a demo credential record for a registered citizen
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/org/credentials')}
          icon={<ArrowLeft weight="bold" className="w-4 h-4" />}
        >
          Cancel
        </Button>
      </div>

      <PrototypeNotice text="Issuance is stored in local demo data and includes simulated proof fields. A protected issuer key and backend are not connected." />

      {issuedId ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle weight="fill" className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Credential Issued Successfully!</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Verifiable Credential <code className="font-mono font-bold text-slate-800">{issuedId}</code> has been registered and made available to{' '}
            <span className="font-semibold text-slate-900">{selectedIdentity?.fullName}</span>.
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIssuedId(null)
                setPreviewMode(false)
              }}
            >
              Issue Another Credential
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/org/credentials/${issuedId}`)}
              iconRight={<ArrowRight weight="bold" className="w-4 h-4" />}
            >
              View Credential Record
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          {error && (
            <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Step 1: Holder & Template selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Select
                  label="1. Select Citizen Identity Holder"
                  value={selectedIdentityId}
                  onChange={(e) => setSelectedIdentityId(e.target.value)}
                  required
                >
                  {organizationIdentities.map((idn) => (
                    <option key={idn.id} value={idn.id}>
                      {idn.fullName} ({idn.idReference || idn.id})
                    </option>
                  ))}
                </Select>
                {selectedIdentity?.did && (
                  <p className="mt-1 text-[11px] font-mono text-slate-400 truncate">
                    DID: {selectedIdentity.did}
                  </p>
                )}
              </div>

              <div>
                <Select
                  label="2. Select Credential Template"
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  required
                >
                  {TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name} ({tmpl.type})
                    </option>
                  ))}
                </Select>
                <p className="mt-1 text-[11px] text-slate-500">
                  {selectedTemplate.description}
                </p>
              </div>
            </div>

            {/* Step 2: Credential Claims */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-1 uppercase tracking-wide">
                3. Credential Attributes & Subject Claims
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter information that will be asserted in the W3C credentialSubject block
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.key}>
                    {field.input === 'select' ? (
                      <Select
                        label={field.label}
                        value={claims[field.key] || ''}
                        onChange={(e) => handleClaimChange(field.key, e.target.value)}
                        required={field.required}
                        helperText={field.hint}
                      >
                        <option value="">Select an option</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        label={field.label}
                        type={field.input === 'date' ? 'date' : 'text'}
                        value={claims[field.key] || ''}
                        onChange={(e) => handleClaimChange(field.key, e.target.value)}
                        required={field.required}
                        helperText={field.hint}
                      />
                    )}
                  </div>
                ))}

                <div>
                  <Input
                    label="Credential Expiration Date"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    required
                    helperText="Date when the verifiable credential expires"
                  />
                </div>
              </div>
            </div>

            {/* Preview Toggle */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Preview W3C JSON-LD Representation
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                  icon={<Eye weight="fill" className="w-3.5 h-3.5" />}
                >
                  {previewMode ? 'Hide Preview' : 'Show JSON Preview'}
                </Button>
              </div>

              {previewMode && (
                <JsonViewer
                  data={{
                    '@context': [
                      'https://www.w3.org/2018/credentials/v1',
                      'https://schema.org',
                    ],
                    id: `urn:shieldid:demo:cred_preview`,
                    type: ['VerifiableCredential', selectedTemplate.type],
                    issuer: {
                      id: 'did:web:harbor.registry.example',
                      name: 'Harbor Civic Registry',
                    },
                    issuanceDate: new Date().toISOString(),
                    expirationDate: `${expiresAt}T23:59:59.000Z`,
                    credentialSubject: {
                      id: selectedIdentity?.did || 'did:key:holderPreview',
                      ...claims,
                    },
                    proof: {
                      type: 'Ed25519Signature2020',
                      created: new Date().toISOString(),
                      verificationMethod: 'did:web:harbor.registry.example#key-1',
                      proofPurpose: 'assertionMethod',
                      proofValue: 'uSIMULATED_PREVIEW_PROOF_VALUE',
                    },
                  }}
                  title="verifiable-credential-preview.json"
                />
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => navigate('/org/credentials')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleIssue}
                icon={<Certificate weight="fill" className="w-4 h-4" />}
              >
                Sign & Issue Verifiable Credential
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
