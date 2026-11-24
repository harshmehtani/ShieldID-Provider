import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowRight, UserPlus, Warning, CheckCircle } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

export const RegisterPage: React.FC = () => {
  const { registerCitizen, state } = useApp()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')
  const [idReference, setIdReference] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName || !email || !phone || !dateOfBirth || !address) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const res = registerCitizen({
        fullName,
        email,
        phone,
        dateOfBirth,
        address,
        idReference: idReference || `REG-${Math.floor(10000 + Math.random() * 90000)}`,
      })
      setLoading(false)

      if (res.success) {
        setSuccess(true)
      } else {
        setError(res.message || 'Registration failed.')
      }
    }, 300)
  }

  const requiresReview = state.settings.requireReviewForRegistration

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2563EB] text-white shadow-sm mb-3">
          <ShieldCheck weight="fill" className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Citizen Identity Registration</h2>
        <p className="mt-1 text-sm text-slate-500">
          Create a decentralized identity record on the Harbor Civic Registry
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-xl border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3">
              <Warning weight="fill" className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle weight="fill" className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Registration Complete</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {requiresReview
                  ? 'Your identity registration has been submitted and queued for Identity Manager review. You will receive access once approved.'
                  : 'Your decentralized identifier has been generated. You can now log into your citizen dashboard using your email.'}
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    if (requiresReview) {
                      navigate('/login')
                    } else {
                      navigate('/citizen/dashboard')
                    }
                  }}
                  iconRight={<ArrowRight weight="bold" className="w-4 h-4" />}
                >
                  {requiresReview ? 'Return to Sign In' : 'Go to Citizen Dashboard'}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Legal Name"
                type="text"
                placeholder="e.g. Maya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  type="tel"
                  placeholder="+91 98111 22334"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
                <Input
                  label="Internal Reference / ID No."
                  type="text"
                  placeholder="HCR-98210 (or leave blank to auto-generate)"
                  value={idReference}
                  onChange={(e) => setIdReference(e.target.value)}
                  helperText="Non-sensitive organizational reference"
                />
              </div>

              <Input
                label="Residential Address"
                type="text"
                placeholder="Street address, City, Postal Code"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-blue-900 leading-relaxed">
                <span className="font-semibold block mb-0.5">Decentralized Identifier Generation:</span>
                This demo records the submitted identity details locally and uses simulated identifier data. No external DID service is called.
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
                icon={<UserPlus weight="fill" className="w-4 h-4" />}
              >
                Create Digital Identity
              </Button>

              <div className="text-center pt-2 text-xs text-slate-500">
                Already registered?{' '}
                <Link to="/login" className="text-[#2563EB] font-semibold hover:underline">
                  Sign in here
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
