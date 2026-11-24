import React from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Warning,
  ArrowLeft,
  ArrowClockwise,
  Check,
  X,
  Buildings,
  User,
  Calendar,
} from '@phosphor-icons/react'
import type { Evaluation } from '@/lib/verify'
import { Badge } from '@/components/common/Badge'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'

export const VerificationResultPage: React.FC = () => {
  const location = useLocation()
  const state = location.state as {
    evaluation?: Evaluation
    credential?: Record<string, any>
    fileName?: string
  }

  if (!state || !state.evaluation) {
    return <Navigate to="/verify" replace />
  }

  const { evaluation, credential, fileName } = state
  const outcome = evaluation.outcome

  const getStatusDisplay = () => {
    switch (outcome) {
      case 'valid':
        return {
          title: 'Prototype Checks Passed',
          subtitle: 'The file passed these local checks. This does not establish that the credential is authentic.',
          icon: <CheckCircle weight="fill" className="w-10 h-10 text-emerald-600" />,
          bannerBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          badgeVariant: 'green' as const,
          label: 'Checks Passed',
        }
      case 'expired':
        return {
          title: 'Credential Expired',
          subtitle: 'The expiration date declared in the file has passed. No signature or live issuer status was checked.',
          icon: <Clock weight="fill" className="w-10 h-10 text-amber-600" />,
          bannerBg: 'bg-amber-50 border-amber-200 text-amber-900',
          badgeVariant: 'purple' as const,
          label: 'Expired',
        }
      case 'revoked':
        return {
          title: 'Credential Revoked',
          subtitle: 'The uploaded file declares a revoked status. No live issuer registry was checked.',
          icon: <XCircle weight="fill" className="w-10 h-10 text-rose-600" />,
          bannerBg: 'bg-rose-50 border-rose-200 text-rose-900',
          badgeVariant: 'red' as const,
          label: 'Revoked',
        }
      case 'invalid':
      default:
        return {
          title: 'Invalid Credential',
          subtitle: 'The file is missing required fields or a proof field. No cryptographic signature was verified.',
          icon: <Warning weight="fill" className="w-10 h-10 text-rose-600" />,
          bannerBg: 'bg-rose-50 border-rose-200 text-rose-900',
          badgeVariant: 'red' as const,
          label: 'Invalid / Tampered',
        }
    }
  }

  const status = getStatusDisplay()

  const issuerName =
    credential?.issuer?.name || credential?.issuerName || 'Verified Institutional Issuer'
  const issuerDid =
    credential?.issuer?.id || credential?.issuerDid || credential?.issuer || 'Unknown'
  const subjectName =
    credential?.credentialSubject?.name ||
    credential?.credentialSubject?.fullName ||
    credential?.subjectName ||
    'Citizen'
  const subjectDid =
    credential?.credentialSubject?.id || credential?.subjectDid || 'Unknown'
  const credType = Array.isArray(credential?.type)
    ? credential.type.filter((t: string) => t !== 'VerifiableCredential').join(', ')
    : credential?.type || 'Verifiable Credential'
  const issuanceDate = credential?.issuanceDate || credential?.issuedAt
  const expirationDate = credential?.expirationDate || credential?.expiresAt

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#2563EB] flex items-center justify-center text-white">
              <ShieldCheck weight="fill" className="w-5 h-5" />
            </div>
            <span className="font-bold text-[#0F172A] text-base tracking-tight">
              ShieldID Verifier
            </span>
          </div>

          <Link
            to="/verify"
            className="inline-flex items-center gap-1.5 text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold"
          >
            <ArrowClockwise weight="bold" className="w-3.5 h-3.5" />
            <span>Verify Another File</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 space-y-6">
        <PrototypeNotice text="This result comes from local prototype checks. It is not a real authenticity, signature, issuer, or live revocation verification." />
        {/* Outcome Banner */}
        <div className={`p-6 rounded-xl border flex items-start gap-4 ${status.bannerBg}`}>
          <div className="shrink-0">{status.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold tracking-tight">{status.title}</h1>
              <Badge variant={status.badgeVariant}>{status.label}</Badge>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">{status.subtitle}</p>
            {fileName && (
              <p className="text-xs opacity-75 mt-2">Checked file: {fileName}</p>
            )}
          </div>
        </div>

        {/* Verification Checks Checklist */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">
            Local File Checks Performed
          </h2>
          <div className="space-y-3">
            {evaluation.checks.map((chk) => (
              <div
                key={chk.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    chk.state === 'pass'
                      ? 'bg-emerald-100 text-emerald-700'
                      : chk.state === 'fail'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {chk.state === 'pass' ? (
                    <Check weight="bold" className="w-3.5 h-3.5" />
                  ) : (
                    <X weight="bold" className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#0F172A]">{chk.label}</p>
                  <p className="text-xs text-[#334155] mt-0.5">{chk.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Credential Details */}
        {credential && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-6">
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider border-b border-slate-100 pb-3">
              Credential Subject & Issuer Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                  <User weight="fill" className="w-4 h-4 text-[#2563EB]" />
                  <span>Subject (Identity Holder)</span>
                </div>
                <p className="text-base font-bold text-[#0F172A]">{subjectName}</p>
                <p className="text-xs font-mono bg-slate-100 p-2 rounded text-slate-700 break-all select-all">
                  {subjectDid}
                </p>
              </div>

              {/* Issuer */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                  <Buildings weight="fill" className="w-4 h-4 text-[#2563EB]" />
                  <span>Issuing Organization</span>
                </div>
                <p className="text-base font-bold text-[#0F172A]">{issuerName}</p>
                <p className="text-xs font-mono bg-slate-100 p-2 rounded text-slate-700 break-all select-all">
                  {issuerDid}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[#64748B] block mb-0.5">Credential Category:</span>
                <span className="font-semibold text-[#0F172A]">{credType}</span>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Issuance Timestamp:</span>
                <span className="font-semibold text-[#0F172A]">
                  {issuanceDate ? new Date(issuanceDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Expiration Timestamp:</span>
                <span className="font-semibold text-[#0F172A]">
                  {expirationDate ? new Date(expirationDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
          >
            <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/verify"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
          >
            <ArrowClockwise weight="bold" className="w-4 h-4" />
            <span>Verify Another Credential</span>
          </Link>
        </div>
      </main>
    </div>
  )
}
