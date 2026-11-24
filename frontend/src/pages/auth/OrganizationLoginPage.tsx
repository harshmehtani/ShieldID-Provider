import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Buildings, ArrowLeft, WarningCircle } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { homeFor } from '@/lib/access'

export const OrganizationLoginPage: React.FC = () => {
  const { login, logout } = useApp()
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
      if (res.role !== 'organization') {
        logout()
        setError('This portal is reserved for registered Organizations. Please use your dedicated login portal.')
        return
      }
      navigate(homeFor(res.role))
    } else {
      setError(res.message || 'Login failed. Please check your credentials.')
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
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
            <Buildings weight="fill" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Organization Sign In</h1>
            <p className="text-xs text-[#64748B]">Manage your credential program & delegates</p>
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
              Official Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@university.edu"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#0F172A]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#2563EB] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
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
            className="w-full mt-2 py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-[#64748B]">
            Not yet registered?{' '}
            <Link to="/org/register" className="text-[#2563EB] font-semibold hover:underline">
              Submit an Organization Application
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
