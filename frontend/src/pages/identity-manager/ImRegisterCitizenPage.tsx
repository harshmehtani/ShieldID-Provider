import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserPlus,
  ArrowLeft,
  CheckCircle,
  Copy,
  Check,
  IdentificationCard,
  Info,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import type { Identity } from '@/types'
import { isValidEmail, normalizeEmail } from '@/lib/validation'
import { todayInputValue } from '@/lib/dates'

export const ImRegisterCitizenPage: React.FC = () => {
  const { currentUser, createIdentity } = useApp()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [registeredCitizen, setRegisteredCitizen] = useState<Identity | null>(null)
  const [copiedDid, setCopiedDid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!currentUser || !currentUser.organizationId) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanName = fullName.trim()
    const cleanEmail = normalizeEmail(email)
    const today = todayInputValue()
    if (!cleanName || !cleanEmail || !dateOfBirth) {
      setError('Complete all three fields before registering the citizen.')
      return
    }
    if (!isValidEmail(cleanEmail)) {
      setError('Enter a valid email address for the citizen.')
      return
    }
    if (dateOfBirth > today) {
      setError('Date of birth cannot be in the future.')
      return
    }

    try {
      const identity = createIdentity({
        organizationId: currentUser.organizationId!,
        fullName: cleanName,
        email: cleanEmail,
        dateOfBirth,
      })
      setRegisteredCitizen(identity)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not register this citizen.')
    }
  }

  const handleReset = () => {
    setFullName('')
    setEmail('')
    setDateOfBirth('')
    setRegisteredCitizen(null)
    setError(null)
  }

  const handleCopyDid = () => {
    if (registeredCitizen?.did) {
      navigator.clipboard.writeText(registeredCitizen.did)
      setCopiedDid(true)
      setTimeout(() => setCopiedDid(false), 3000)
    }
  }

  if (registeredCitizen) {
    // Format DDMMYYYY password for display notice
    const parts = registeredCitizen.dateOfBirth.split('-')
    const formattedPassword =
      parts.length === 3 ? `${parts[2]}${parts[1]}${parts[0]}` : 'DDMMYYYY'

    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircle weight="fill" className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-[#0F172A] mb-1">
            Citizen Registered Successfully
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            Decentralized identity and account provisioned for <strong>{registeredCitizen.fullName}</strong>
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-[#64748B]">Full Name:</span>
                <span className="font-semibold text-[#0F172A]">{registeredCitizen.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-[#64748B]">Email:</span>
                <span className="font-semibold text-[#0F172A]">{registeredCitizen.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-[#64748B]">Date of Birth:</span>
                <span className="font-semibold text-[#0F172A]">{registeredCitizen.dateOfBirth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Initial Password:</span>
                <span className="font-mono font-bold text-[#2563EB]">{formattedPassword}</span>
              </div>
            </div>

            {/* Generated DID */}
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
              <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider block mb-1">
                Anchored Decentralized Identifier (DID)
              </span>
              <p className="font-mono text-xs text-slate-800 break-all select-all mb-3">
                {registeredCitizen.did}
              </p>
              <button
                type="button"
                onClick={handleCopyDid}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#2563EB] bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
              >
                {copiedDid ? <Check weight="bold" className="w-3.5 h-3.5" /> : <Copy weight="bold" className="w-3.5 h-3.5" />}
                <span>{copiedDid ? 'Copied DID' : 'Copy DID'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-start gap-2 text-xs text-slate-600">
              <Info weight="fill" className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                The citizen can now sign in at the Citizen Portal using their email and initial password (DOB in DDMMYYYY format: <strong>{formattedPassword}</strong>).
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2.5 px-4 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#0F172A] text-xs font-semibold rounded-md transition-colors"
            >
              Register Another Citizen
            </button>
            <button
              type="button"
              onClick={() => navigate('/im/citizens')}
              className="flex-1 py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors"
            >
              View All Citizens
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        to="/im/citizens"
        className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
      >
        <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
        <span>Back to Citizens List</span>
      </Link>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
            <UserPlus weight="fill" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0F172A]">Register Citizen</h1>
            <p className="text-xs text-[#64748B]">
              Provision a decentralized identity for a new citizen subject
            </p>
          </div>
        </div>

        {/* 3 fields only per PRD */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Kwame Asante"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Date of Birth *
            </label>
            <input
              type="date"
              required
              max={new Date().toISOString().slice(0, 10)}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
            <p className="text-[11px] text-[#64748B] mt-1">
              Used to configure the citizen's initial authentication password (DDMMYYYY).
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md transition-colors"
            >
              Generate DID & Register Citizen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
