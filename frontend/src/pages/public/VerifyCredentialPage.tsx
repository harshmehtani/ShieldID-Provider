import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, UploadSimple, FileText, WarningCircle } from '@phosphor-icons/react'
import { evaluateCredentialJson } from '@/lib/verify'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'

export const VerifyCredentialPage: React.FC = () => {
  const navigate = useNavigate()
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const processFile = (file: File) => {
    setError(null)
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Please upload a valid JSON credential file (.json).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Please choose a JSON file smaller than 5 MB.')
      return
    }

    setLoading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsed = JSON.parse(text)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Credential JSON must contain an object.')
        }
        const evaluation = evaluateCredentialJson(parsed)
        navigate('/verify/result', {
          state: {
            evaluation,
            credential: parsed,
            fileName: file.name,
          },
        })
      } catch (err) {
        setError('Failed to parse file. Ensure it is a valid, uncorrupted JSON document.')
        setLoading(false)
      }
    }
    reader.onerror = () => {
      setError('Error reading file from disk.')
      setLoading(false)
    }
    reader.readAsText(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Header */}
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
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
          >
            <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Upload Body */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
            Verify a Verifiable Credential
          </h1>
          <p className="text-sm text-[#334155] max-w-lg mx-auto">
            Upload a credential JSON file (.json) to check its required fields, declared expiry, and any status recorded in the file.
          </p>
        </div>

        <PrototypeNotice className="mb-6 text-left" text="This demo checks the uploaded file locally. It does not verify digital signatures, contact the issuer, check a live revocation registry, or upload the file to a server." />

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
            <WarningCircle weight="fill" className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all bg-white ${
            dragActive
              ? 'border-[#2563EB] bg-[#EFF6FF]'
              : 'border-[#CBD5E1] hover:border-[#94A3B8]'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-4">
            <UploadSimple weight="bold" className="w-7 h-7" />
          </div>

          <p className="text-base font-semibold text-[#0F172A] mb-1">
            Drag and drop your credential file here
          </p>
          <p className="text-xs text-[#64748B] mb-6">
            Accepts credential JSON files (.json)
          </p>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md cursor-pointer transition-colors shadow-xs">
            <FileText weight="fill" className="w-4 h-4" />
            <span>{loading ? 'Processing File...' : 'Browse Local File'}</span>
            <input
              type="file"
              accept=".json"
              disabled={loading}
              onChange={handleChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-8 p-4 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs text-[#64748B] space-y-1">
          <p className="font-semibold text-[#0F172A]">Prototype checks:</p>
          <p>• Looks for the credential context, type, issuer, subject, and proof fields.</p>
          <p>• Reads the declared expiration and status values from the file.</p>
          <p>• The file is processed in this browser; no live issuer or revocation service is queried.</p>
        </div>
      </main>
    </div>
  )
}
