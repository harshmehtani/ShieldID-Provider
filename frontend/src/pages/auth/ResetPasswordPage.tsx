import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, CheckCircle, Lock } from '@phosphor-icons/react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useApp } from '@/context/AppContext'

export const ResetPasswordPage: React.FC = () => {
  const { showToast } = useApp()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      showToast('info', 'Demo validation complete', 'No account password was changed.')
    }, 400)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2563EB] text-white shadow-sm mb-3">
          <ShieldCheck weight="fill" className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Choose New Password</h2>
        <p className="mt-1 text-sm text-slate-500">
          Demo only. This form validates locally; it does not change an account password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-xl border border-slate-200 shadow-sm space-y-6">
          {success ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle weight="fill" className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Demo Validation Complete</h3>
              <p className="text-xs text-slate-600">
                The password fields passed the demo checks. No password was saved or changed.
              </p>
              <div className="pt-2">
                <Button variant="primary" className="w-full" onClick={() => navigate('/login')}>
                  Proceed to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-medium">
                  {error}
                </div>
              )}

              <Input
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
                icon={<Lock weight="fill" className="w-4 h-4" />}
              >
                Save New Password
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-[#2563EB] font-medium hover:underline">
                  Cancel and return to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
