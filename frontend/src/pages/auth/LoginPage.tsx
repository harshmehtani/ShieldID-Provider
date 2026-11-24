import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck,
  User,
  Buildings,
  IdentificationCard,
  Lock,
  ArrowRight,
  Warning,
  Info,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { DEMO_ACCOUNTS, EXTRA_ACCOUNTS, DEMO_PASSWORD } from '@/data/seed'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { homeFor } from '@/lib/access'

export const LoginPage: React.FC = () => {
  const { login, state } = useApp()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('demo1234')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = (loginEmail: string, loginPass: string = 'demo1234') => {
    setError(null)
    setLoading(true)

    setTimeout(() => {
      const res = login(loginEmail, loginPass)
      setLoading(false)

      if (res.success) {
        const found = state.users.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase().trim())
        if (found) {
          navigate(homeFor(found.role))
        } else {
          navigate('/org/dashboard')
        }
      } else {
        setError(res.message || 'Login failed.')
      }
    }, 250)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    handleLogin(email, password)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2563EB] text-white shadow-sm mb-3">
          <ShieldCheck weight="fill" className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">ShieldID Provider</h2>
        <p className="mt-1 text-sm text-slate-500">
          Decentralized Identity & Verifiable Credential Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-xl border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3">
              <Warning weight="fill" className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800 leading-relaxed font-medium">{error}</div>
            </div>
          )}

          {/* Quick 1-Click Role Login Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Persona (Instant Demo Sign-in)
              </span>
              <span className="text-[11px] text-blue-600 font-medium">1-Click Access</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                let icon = <Buildings weight="fill" className="w-4 h-4 text-blue-600" />
                if (acc.role === 'Identity manager') {
                  icon = <IdentificationCard weight="fill" className="w-4 h-4 text-indigo-600" />
                } else if (acc.role === 'Citizen') {
                  icon = <User weight="fill" className="w-4 h-4 text-emerald-600" />
                } else if (acc.role === 'System administrator') {
                  icon = <Lock weight="fill" className="w-4 h-4 text-purple-600" />
                }

                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email)
                      setPassword(DEMO_PASSWORD)
                      handleLogin(acc.email, DEMO_PASSWORD)
                    }}
                    className="flex flex-col text-left p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all text-xs group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-slate-900 group-hover:text-blue-700">
                        {acc.name}
                      </span>
                      {icon}
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 mb-1">
                      {acc.role}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{acc.detail}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">Or enter credentials</span>
            </div>
          </div>

          {/* Manual Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya.nair@shieldid.demo"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-800">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#2563EB] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Default demonstration password is <code className="font-mono font-medium text-slate-600">demo1234</code>
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              iconRight={<ArrowRight weight="bold" className="w-4 h-4" />}
            >
              Sign In to ShieldID
            </Button>
          </form>

          {/* Extra Test Accounts Drawer */}
          <div className="pt-2 border-t border-slate-100">
            <details className="text-xs text-slate-500">
              <summary className="cursor-pointer font-medium text-slate-600 hover:text-slate-900 select-none py-1 flex items-center justify-between">
                <span>View Edge-Case Test Accounts (Blocked / Suspended / Revoked)</span>
                <span className="text-[10px] text-blue-600 font-semibold">4 test accounts</span>
              </summary>
              <div className="mt-2 space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {EXTRA_ACCOUNTS.map((extra) => (
                  <button
                    key={extra.email}
                    type="button"
                    onClick={() => {
                      setEmail(extra.email)
                      setPassword(DEMO_PASSWORD)
                      handleLogin(extra.email, DEMO_PASSWORD)
                    }}
                    className="w-full flex items-center justify-between p-1.5 text-left rounded-md hover:bg-white text-xs transition-colors"
                  >
                    <div>
                      <span className="font-medium text-slate-800 block">{extra.name}</span>
                      <span className="text-[11px] text-slate-500">{extra.detail}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{extra.email}</span>
                  </button>
                ))}
              </div>
            </details>
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Don't have an identity account?</span>
            <Link to="/register" className="text-[#2563EB] font-semibold hover:underline">
              Register as Citizen
            </Link>
          </div>
        </div>

        {/* Prototype compliance note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Info weight="fill" className="w-4 h-4 text-slate-400" />
            W3C Verifiable Credentials 1.0 & Decentralized Identifiers (DIDs)
          </p>
        </div>
      </div>
    </div>
  )
}
