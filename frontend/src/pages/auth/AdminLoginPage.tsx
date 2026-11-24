import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, WarningCircle } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { homeFor } from '@/lib/access'

export const AdminLoginPage: React.FC = () => {
  const { login } = useApp()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = login(email, password)
    setLoading(false)

    if (res.success && res.role) {
      if (res.role !== 'administrator') {
        setError('Unauthorized. This portal is restricted to System Administrators.')
        return
      }
      navigate(homeFor(res.role))
    } else {
      setError(res.message || 'Authentication failed. Please verify credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-xl shadow-xs p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium mb-6"
        >
          <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <ShieldCheck weight="fill" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">System Administrator</h1>
            <p className="text-xs text-[#64748B]">Platform oversight & accreditation</p>
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
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@shieldid.local"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In as Administrator'}
          </button>
        </form>
      </div>
    </div>
  )
}
