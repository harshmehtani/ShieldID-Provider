import React, { useState } from 'react'
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Warning,
  Certificate,
  ShareNetwork,
  Code,
  ArrowRight,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Textarea } from '@/components/common/Textarea'
import { Badge } from '@/components/common/Badge'
import { JsonViewer } from '@/components/common/JsonViewer'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'
import { buildCredentialJson } from '@/lib/credential'
import { formatOptionalDate } from '@/lib/dates'
import type { Evaluation } from '@/lib/verify'
import type { Credential } from '@/types'

export const VerifyCredentialPage: React.FC = () => {
  const { verifyCredentialInput, state } = useApp()

  const [mode, setMode] = useState<'id' | 'code' | 'json'>('id')
  const [credentialId, setCredentialId] = useState('cred_aarav_id')
  const [presentationCode, setPresentationCode] = useState('share_aarav_emp_demo')
  const [rawJson, setRawJson] = useState('')
  const [loading, setLoading] = useState(false)

  const [result, setResult] = useState<
    (Evaluation & { credential?: Credential | null; verificationId: string }) | null
  >(null)

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      let evalResult: Evaluation & { credential?: Credential | null; verificationId: string }
      if (mode === 'id') {
        evalResult = verifyCredentialInput({ credentialId })
      } else if (mode === 'code') {
        evalResult = verifyCredentialInput({ presentationCode })
      } else {
        evalResult = verifyCredentialInput({ rawJson })
      }
      setResult(evalResult)
      setLoading(false)
    }, 350)
  }

  // Pre-fill demo options
  const samplePresets = [
    { label: 'Aarav - Valid ID Credential', id: 'cred_aarav_id', mode: 'id' as const },
    { label: 'Meera - Expired Employment Credential', id: 'cred_meera_emp', mode: 'id' as const },
    { label: 'Meera - Revoked Identity Credential', id: 'cred_meera_id', mode: 'id' as const },
    { label: 'Active Presentation Share', id: 'share_aarav_emp_demo', mode: 'code' as const },
  ]

  const handleSelectPreset = (preset: (typeof samplePresets)[0]) => {
    setMode(preset.mode)
    if (preset.mode === 'id') {
      setCredentialId(preset.id)
    } else {
      setPresentationCode(preset.id)
    }
    setResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Universal Credential Verification
        </h1>
        <p className="text-sm text-slate-500">
          Inspect local demo credentials and uploaded data for required fields and declared status
        </p>
      </div>

      <PrototypeNotice text="Checks run against local demo data. Signatures, DID resolution, issuer status, and live revocation registries are not verified." />

      {/* Preset Quick Selectors */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          Test Presets (Demonstration Scenarios)
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-xs font-medium px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Input Box */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={() => {
              setMode('id')
              setResult(null)
            }}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              mode === 'id'
                ? 'border-[#2563EB] text-[#2563EB] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Certificate weight="fill" className="w-4 h-4" />
            By Credential ID
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('code')
              setResult(null)
            }}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              mode === 'code'
                ? 'border-[#2563EB] text-[#2563EB] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShareNetwork weight="fill" className="w-4 h-4" />
            By Presentation Code
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('json')
              setResult(null)
            }}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              mode === 'json'
                ? 'border-[#2563EB] text-[#2563EB] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code weight="fill" className="w-4 h-4" />
            Paste Raw W3C JSON
          </button>
        </div>

        <form onSubmit={handleVerify} className="p-6 space-y-4">
          {mode === 'id' && (
            <div>
              <Input
                label="Credential Identifier"
                placeholder="e.g. cred_aarav_id or urn:shieldid:demo:cred_aarav_id"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                required
                helperText="Enter any registered credential ID"
              />
            </div>
          )}

          {mode === 'code' && (
            <div>
              <Input
                label="Presentation Share Code"
                placeholder="e.g. share_aarav_emp_demo"
                value={presentationCode}
                onChange={(e) => setPresentationCode(e.target.value)}
                required
                helperText="Enter a share code generated through citizen selective disclosure"
              />
            </div>
          )}

          {mode === 'json' && (
            <div>
              <Textarea
                label="W3C Verifiable Credential Payload"
                rows={7}
                placeholder='{ "@context": ["https://www.w3.org/2018/credentials/v1"], ... }'
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                required
                className="font-mono text-xs"
                helperText="Paste full W3C compliant JSON-LD verifiable credential"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Performs 5-point verification check against issuer DID and registry
            </span>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={<ShieldCheck weight="fill" className="w-4 h-4" />}
            >
              Execute Verification
            </Button>
          </div>
        </form>
      </div>

      {/* Verification Result Section */}
      {result && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
          {/* Outcome Banner */}
          <div
            className={`p-4 rounded-lg border flex items-start gap-3.5 ${
              result.outcome === 'valid'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : result.outcome === 'expired'
                ? 'bg-purple-50 border-purple-200 text-purple-900'
                : result.outcome === 'revoked'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {result.outcome === 'valid' ? (
                <CheckCircle weight="fill" className="w-6 h-6 text-emerald-600" />
              ) : result.outcome === 'expired' ? (
                <Warning weight="fill" className="w-6 h-6 text-purple-600" />
              ) : result.outcome === 'revoked' ? (
                <XCircle weight="fill" className="w-6 h-6 text-rose-600" />
              ) : (
                <Warning weight="fill" className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold uppercase tracking-wide">
                  Verification Status:
                </span>
                <Badge variant={result.outcome}>
                  {result.outcome.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs leading-relaxed font-medium">{result.summary}</p>
            </div>
          </div>

          {/* Verification Checks Checklist */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Verification Engine Checks
            </h3>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden text-xs">
              {result.checks.map((check) => (
                <div key={check.id} className="p-3.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    {check.state === 'pass' ? (
                      <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : check.state === 'warn' ? (
                      <Warning weight="fill" className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle weight="fill" className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-900 block">{check.label}</span>
                      <span className="text-slate-500 mt-0.5 block leading-relaxed">
                        {check.detail}
                      </span>
                    </div>
                  </div>
                  <Badge variant={check.state}>{check.state.toUpperCase()}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Credential Attributes & W3C JSON */}
          {result.credential && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Credential Claims & Metadata
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Credential ID</span>
                  <span className="font-mono font-medium text-slate-900">
                    {result.credential.id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Type</span>
                  <span className="font-semibold text-slate-900">{result.credential.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Issued To</span>
                  <span className="font-semibold text-slate-900">
                    {result.credential.subjectName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Expires</span>
                  <span className="font-medium text-slate-900">
                    {formatOptionalDate(result.credential.expiresAt)}
                  </span>
                </div>
              </div>

              {/* Claims Breakdown */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
                  Asserted Subject Claims
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {Object.entries(result.credential.claims).map(([key, val]) => (
                    <div key={key} className="px-4 py-2.5 flex justify-between gap-4">
                      <span className="text-slate-500 font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-semibold text-slate-900 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* JSON representation */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                  W3C JSON-LD Representation
                </span>
                <JsonViewer
                  data={buildCredentialJson(result.credential)}
                  title={`${result.credential.id}.jsonld`}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
