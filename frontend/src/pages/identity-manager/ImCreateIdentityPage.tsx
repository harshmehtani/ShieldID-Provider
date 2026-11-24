import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IdentificationCard,
  Key,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Eye,
  ShieldCheck,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { JsonViewer } from '@/components/common/JsonViewer'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'
import { makeDid } from '@/lib/ids'
import { didDocument } from '@/lib/credential'
import { hasText, isValidEmail, normalizeEmail } from '@/lib/validation'
import { todayInputValue } from '@/lib/dates'

export const ImCreateIdentityPage: React.FC = () => {
  const { createIdentity, currentUser, state } = useApp()
  const navigate = useNavigate()

  const orgId = currentUser?.organizationId || state.organizations[0]?.id

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('1998-05-15')
  const [address, setAddress] = useState('')
  const [idReference, setIdReference] = useState('')
  const [didMethod, setDidMethod] = useState<'did:key' | 'did:web'>('did:key')

  // DID generation state
  const [generatedDid, setGeneratedDid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [createdIdentityId, setCreatedIdentityId] = useState<string | null>(null)

  const handleGenerateDid = () => {
    if (!hasText(fullName)) {
      setError('Please provide citizen full name first.')
      return
    }
    setError(null)
    const newDid =
      didMethod === 'did:web'
        ? `did:web:${fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}.identity.example`
        : makeDid()
    setGeneratedDid(newDid)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanName = fullName.trim()
    const cleanEmail = normalizeEmail(email)
    const cleanPhone = phone.trim()
    const cleanAddress = address.trim()

    if (!hasText(cleanName) || !cleanEmail || !hasText(cleanPhone) || !hasText(cleanAddress)) {
      setError('Please fill in all required citizen details.')
      return
    }
    if (!isValidEmail(cleanEmail)) {
      setError('Enter a valid email address for the citizen.')
      return
    }
    if (!dateOfBirth || dateOfBirth > todayInputValue()) {
      setError('Enter a valid date of birth that is not in the future.')
      return
    }

    const ref = idReference || `HCR-${Math.floor(10000 + Math.random() * 90000)}`

    if (!orgId) {
      setError('Choose an active organization before registering a citizen.')
      return
    }

    try {
      const created = createIdentity({
        organizationId: orgId,
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        address: cleanAddress,
        idReference: ref.trim(),
        dateOfBirth,
        did: generatedDid || undefined,
      })
      setCreatedIdentityId(created.id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not register this citizen.')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Register Decentralized Identity
          </h1>
          <p className="text-sm text-slate-500">
            Enroll a citizen and create a demo decentralized identifier
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/im/identities')}
          icon={<ArrowLeft weight="bold" className="w-4 h-4" />}
        >
          Back
        </Button>
      </div>

      <PrototypeNotice text="Identifiers and verification keys on this screen are generated for the local prototype; no external DID network is used." />

      {createdIdentityId ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle weight="fill" className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Identity Registered & DID Created</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Citizen <span className="font-semibold text-slate-900">{fullName}</span> has been enrolled with decentralized identifier:
          </p>
          <code className="block p-3 rounded-md bg-slate-100 border border-slate-200 font-mono text-xs text-slate-800 break-all max-w-lg mx-auto">
            {generatedDid || 'did:key:...'}
          </code>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setCreatedIdentityId(null)
                setGeneratedDid(null)
                setFullName('')
                setEmail('')
                setPhone('')
                setAddress('')
              }}
            >
              Enroll Another Citizen
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/im/identities/${createdIdentityId}`)}
              iconRight={<ArrowRight weight="bold" className="w-4 h-4" />}
            >
              Inspect Identity Record
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          {error && (
            <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Citizen Information */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 uppercase tracking-wide">
                1. Citizen Personal Information
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Required identity attributes stored in registry
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Legal Name"
                  placeholder="e.g. Maya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="maya.sharma@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  placeholder="+91 98111 22334"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Residential Address"
                    placeholder="Street address, City, State, Postal Code"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Internal Reference ID"
                  placeholder="e.g. HCR-24090"
                  value={idReference}
                  onChange={(e) => setIdReference(e.target.value)}
                  helperText="Leave blank to auto-generate institutional record code"
                />
              </div>
            </div>

            {/* DID Configuration */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-1 uppercase tracking-wide">
                2. Decentralized Identifier (DID) Generation
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Choose a DID method for this demo identifier
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="DID Method"
                  value={didMethod}
                  onChange={(e) => {
                    setDidMethod(e.target.value as 'did:key' | 'did:web')
                    setGeneratedDid(null)
                  }}
                >
                  <option value="did:key">did:key (Self-certifying Ed25519 multicodec)</option>
                  <option value="did:web">did:web (Web domain resolution)</option>
                </Select>

                <div className="flex flex-col justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateDid}
                    icon={<Key weight="fill" className="w-4 h-4 text-indigo-600" />}
                  >
                    Generate Identifier
                  </Button>
                </div>
              </div>

              {generatedDid && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200">
                    <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block mb-1">
                      Generated Decentralized Identifier
                    </span>
                    <code className="text-xs font-mono text-indigo-950 font-bold break-all block">
                      {generatedDid}
                    </code>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                      Generated W3C DID Document
                    </span>
                    <JsonViewer
                      data={didDocument(generatedDid)}
                      title="did-document.json"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => navigate('/im/identities')}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<IdentificationCard weight="fill" className="w-4 h-4" />}
              >
                Enroll Citizen & Store DID
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
