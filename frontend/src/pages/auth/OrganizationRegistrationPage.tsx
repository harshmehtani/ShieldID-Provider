import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Buildings, ArrowLeft, CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'

export const OrganizationRegistrationPage: React.FC = () => {
  const { registerOrganization } = useApp()

  const [name, setName] = useState('')
  const [orgType, setOrgType] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nominatedImName, setNominatedImName] = useState('')
  const [nominatedImEmail, setNominatedImEmail] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanName = name.trim()
    const cleanOrgType = orgType.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanManagerName = nominatedImName.trim()
    const cleanManagerEmail = nominatedImEmail.trim().toLowerCase()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!cleanName || !cleanOrgType || !cleanManagerName) {
      setError('Complete all required organization and manager fields.')
      return
    }

    if (!emailPattern.test(cleanEmail) || !emailPattern.test(cleanManagerEmail)) {
      setError('Enter a valid email address for the organization and nominated manager.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const res = registerOrganization({
      name: cleanName,
      orgType: cleanOrgType,
      email: cleanEmail,
      password,
      nominatedImName: cleanManagerName,
      nominatedImEmail: cleanManagerEmail,
    })

    if (res.ok) {
      setSubmitted(true)
    } else {
      setError(res.message || 'Failed to submit application.')
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-xl shadow-xs p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle weight="fill" className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-[#0F172A] mb-2">
            Application Submitted
          </h2>
          <p className="text-sm text-[#334155] leading-relaxed mb-6">
            Your application for <strong>{name}</strong> has been received and is pending System Administrator review.
          </p>

          <div className="bg-slate-50 border border-[#E2E8F0] rounded-lg p-4 text-left text-xs space-y-2 mb-6">
            <div>
              <span className="text-[#64748B]">Official Email: </span>
              <span className="font-semibold text-[#0F172A]">{email}</span>
            </div>
            <div>
              <span className="text-[#64748B]">Nominated Identity Manager: </span>
              <span className="font-semibold text-[#0F172A]">{nominatedImName} ({nominatedImEmail})</span>
            </div>
            <div>
              <span className="text-[#64748B]">Status: </span>
              <span className="font-semibold text-amber-600">Pending Approval</span>
            </div>
          </div>

          <p className="text-xs text-[#64748B] mb-6">
            After approval, sign in to the organization account and invite the nominated manager from the Identity Managers page.
          </p>

          <Link
            to="/"
            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-lg bg-white border border-[#E2E8F0] rounded-xl shadow-xs p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium mb-6"
        >
          <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
            <Buildings weight="fill" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Organization Registration</h1>
            <p className="text-xs text-[#64748B]">Apply for accreditation as a trusted credential issuer</p>
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
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. National Accreditation Board"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Organization Type *
            </label>
            <input
              type="text"
              required
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              placeholder="e.g. Educational Institution, Healthcare, Enterprise"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Official Institutional Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. registrar@university.edu"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Password * (min 8 chars)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          {/* Section Divider: Nominated First Identity Manager */}
          <div className="pt-4 border-t border-[#E2E8F0]">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
              Nominated First Identity Manager
            </h3>
            <p className="text-[11px] text-[#64748B] mb-3">
              The designated operational staff member who will perform citizen registration and credential issuance upon approval.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Manager Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={nominatedImName}
                  onChange={(e) => setNominatedImName(e.target.value)}
                  placeholder="e.g. Dr. Kwabena Mensah"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Manager Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={nominatedImEmail}
                  onChange={(e) => setNominatedImEmail(e.target.value)}
                  placeholder="e.g. kmensah@university.edu"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md transition-colors"
          >
            Submit Application
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-[#64748B]">
            Already registered?{' '}
            <Link to="/org/login" className="text-[#2563EB] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
