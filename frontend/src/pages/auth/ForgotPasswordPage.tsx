import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, EnvelopeSimple, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 400)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2563EB] text-white shadow-sm mb-3">
          <ShieldCheck weight="fill" className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Reset Your Password</h2>
        <p className="mt-1 text-sm text-slate-500">
          Demo only. No reset email is sent until the backend email service is connected.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-xl border border-slate-200 shadow-sm space-y-6">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle weight="fill" className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Demo Request Recorded</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No email was sent. The reset request for <span className="font-semibold text-slate-900">{email}</span> is only demonstrated in this prototype.
              </p>
              <div className="pt-3">
                <Link to="/reset-password">
                  <Button variant="outline" size="sm" className="w-full mb-2">
                    Open Demo Reset Form
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="w-full" icon={<ArrowLeft weight="bold" className="w-4 h-4" />}>
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="priya.nair@shieldid.demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
                icon={<EnvelopeSimple weight="fill" className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs text-[#2563EB] font-medium hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
                  Return to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
