import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Buildings,
  UserGear,
  IdentificationCard,
  Lock,
  ArrowRight,
  CheckCircle,
  FileText,
} from '@phosphor-icons/react'

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#2563EB] flex items-center justify-center text-white">
              <ShieldCheck weight="fill" className="w-5 h-5" />
            </div>
            <span className="font-bold text-[#0F172A] text-sm sm:text-lg tracking-tight whitespace-nowrap">
              ShieldID Provider
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/verify"
              className="inline-flex items-center gap-1 px-2 sm:gap-1.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#2563EB] bg-[#EFF6FF] hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap"
            >
              <FileText weight="fill" className="w-4 h-4" />
              <span>Verify a Credential</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 flex flex-col items-center">
        <div className="max-w-2xl text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <CheckCircle weight="fill" className="w-3.5 h-3.5" />
            Digital identity and verifiable credentials
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Trust in every credential.
          </h1>

          <p className="text-base sm:text-lg text-[#334155] leading-relaxed">
            Issue, manage, and verify digital identity credentials securely. Organizations issue credentials, citizens access them, and anyone can verify a credential without an account.
          </p>
        </div>

        {/* Role portals */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 max-w-6xl mb-16">
          {/* Organization Card */}
          <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
              <Buildings weight="fill" className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-1">Organization</h3>
            <p className="text-sm text-[#64748B] flex-1 mb-6">
              Register your organization, track its approval, and manage your identity managers.
            </p>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Link
                to="/org/login"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md transition-colors"
              >
                <span>Sign In</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </Link>
              <Link
                to="/org/register"
                className="block text-center text-xs text-[#2563EB] hover:underline font-medium py-1"
              >
                Register Organization →
              </Link>
            </div>
          </div>

          {/* Identity Manager Card */}
          <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
              <UserGear weight="fill" className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-1">Identity Manager</h3>
            <p className="text-sm text-[#64748B] flex-1 mb-6">
              Register citizens and issue credentials on behalf of your approved organization.
            </p>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/im/login"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md transition-colors"
              >
                <span>Sign In</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </Link>
              <p className="text-center text-[11px] text-slate-400 py-1.5">
                Access granted via organization invitation
              </p>
            </div>
          </div>

          {/* Citizen Card */}
          <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
              <IdentificationCard weight="fill" className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-1">Citizen</h3>
            <p className="text-sm text-[#64748B] flex-1 mb-6">
              Sign in to view your credential and download its JSON file.
            </p>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/citizen/login"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md transition-colors"
              >
                <span>Sign In</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </Link>
              <p className="text-center text-[11px] text-slate-400 py-1.5">
                Citizen accounts are created by an Identity Manager
              </p>
            </div>
          </div>

        {/* System Administrator Card */}
        <div className="border border-[#E2E8F0] rounded-xl p-6 bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col">
          <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
            <Lock weight="fill" className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-1">System Administrator</h3>
          <p className="text-sm text-[#64748B] flex-1 mb-6">
            Review organization applications and inspect platform audit activity.
          </p>
          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/admin/login"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md transition-colors"
            >
              <span>Sign In</span>
              <ArrowRight weight="bold" className="w-4 h-4" />
            </Link>
            <p className="text-center text-[11px] text-slate-400 py-1.5">
              Restricted administrator access
            </p>
          </div>
        </div>
        </div>

        {/* Public Verification Banner */}
        <div className="w-full max-w-4xl bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck weight="fill" className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#0F172A]">
                External Verifier Portal
              </h4>
              <p className="text-sm text-[#334155]">
              Upload a credential JSON file to check its required fields and declared expiry or status.
              </p>
            </div>
          </div>

          <Link
            to="/verify"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-semibold rounded-md transition-colors"
          >
            <FileText weight="fill" className="w-4 h-4" />
            <span>Verify File</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-6 px-4 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <p>© 2026 ShieldID Provider</p>
          <Link to="/verify" className="hover:text-[#0F172A]">Verify a Credential</Link>
        </div>
      </footer>
    </div>
  )
}
