import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserPlus,
  ArrowLeft,
  Copy,
  Check,
  WarningCircle,
  Warning,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { hasText, isValidEmail, normalizeEmail } from '@/lib/validation'

export const OrgAddManagerPage: React.FC = () => {
  const { currentUser, inviteIdentityManager } = useApp()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  // One-time temporary password state
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!currentUser || !currentUser.organizationId) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanName = name.trim()
    const cleanEmail = normalizeEmail(email)
    if (!hasText(cleanName) || !cleanEmail) {
      setError('Enter the manager’s name and email address.')
      return
    }
    if (!isValidEmail(cleanEmail)) {
      setError('Enter a valid email address for the manager.')
      return
    }

    const res = inviteIdentityManager({
      organizationId: currentUser.organizationId!,
      name: cleanName,
      email: cleanEmail,
    })

    if (res.ok && res.tempPassword) {
      setTempPassword(res.tempPassword)
    } else {
      setError(res.message || 'Failed to add Identity Manager.')
    }
  }

  const handleCopy = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  if (tempPassword) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Check weight="bold" className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-[#0F172A] mb-1">
            Identity Manager Invitation Created
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
              An invited account was created for <strong>{name}</strong> ({email}). Their first successful sign-in activates it.
          </p>

          {/* Warning banner */}
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <Warning weight="fill" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Save this temporary password immediately</p>
              <p className="mt-0.5 opacity-90">
                This password is only displayed once and cannot be recovered or retrieved once you leave this page.
              </p>
            </div>
          </div>

          {/* Password Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
              Temporary Activation Password
            </span>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#0F172A] tracking-wider select-all">
                {tempPassword}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                }`}
              >
                {copied ? <Check weight="bold" className="w-4 h-4" /> : <Copy weight="bold" className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/org/managers')}
            className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-semibold rounded-md transition-colors"
          >
            Done — Return to Identity Managers Roster
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        to="/org/managers"
        className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
      >
        <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
        <span>Back to Identity Managers</span>
      </Link>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
            <UserPlus weight="fill" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0F172A]">Add Identity Manager</h1>
            <p className="text-xs text-[#64748B]">
              Authorize a team member to manage citizen identities
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <WarningCircle weight="fill" className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Kwame Mensah"
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
              placeholder="e.g. kmensah@institution.edu"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md transition-colors"
            >
              Generate Temporary Password & Authorize
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
