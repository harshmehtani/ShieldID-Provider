import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  IdentificationCard,
  GraduationCap,
  Briefcase,
  WarningCircle,
  Certificate,
  User,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'
import { isValidEmail, hasText } from '@/lib/validation'
import { todayInputValue } from '@/lib/dates'

type CredentialCategory = 'IdentityCredential' | 'EducationCredential' | 'EmploymentCredential'

export const ImIssueCredentialPage: React.FC = () => {
  const { state, currentUser, issueCredential } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const preselectedCitizenId = searchParams.get('citizenId')

  if (!currentUser || !currentUser.organizationId) {
    return null
  }

  const orgId = currentUser.organizationId
  const organization = state.organizations.find((o) => o.id === orgId)

  // STRICT PRD FILTER: Only citizens who have NEVER received a credential
  const eligibleCitizens = state.identities.filter((cit) => {
    if (cit.organizationId !== orgId) return false
    const hasCred = state.credentials.some((c) => c.identityId === cit.id)
    return !hasCred
  })

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>(preselectedCitizenId || '')
  const [selectedCategory, setSelectedCategory] = useState<CredentialCategory>('IdentityCredential')

  // Form Fields per category
  // Identity fields
  const [idFullName, setIdFullName] = useState('')
  const [idDob, setIdDob] = useState('')
  const [idEmail, setIdEmail] = useState('')

  // Education fields
  const [eduInstitution, setEduInstitution] = useState(organization?.name || '')
  const [eduDegree, setEduDegree] = useState('')
  const [eduField, setEduField] = useState('')
  const [eduAwardDate, setEduAwardDate] = useState('')

  // Employment fields
  const [empEmployer, setEmpEmployer] = useState(organization?.name || '')
  const [empJobTitle, setEmpJobTitle] = useState('')
  const [empType, setEmpType] = useState('Full-time')
  const [empStartDate, setEmpStartDate] = useState('')
  const [empEndDate, setEmpEndDate] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [issuedCredId, setIssuedCredId] = useState<string | null>(null)

  // Auto-populate identity fields when citizen is chosen
  const selectedCitizen = state.identities.find((i) => i.id === selectedCitizenId)

  useEffect(() => {
    if (selectedCitizen) {
      setIdFullName(selectedCitizen.fullName)
      setIdDob(selectedCitizen.dateOfBirth)
      setIdEmail(selectedCitizen.email)
    }
  }, [selectedCitizen])

  const handleNextFromStep1 = () => {
    if (!selectedCitizenId) {
      setError('Please select an eligible citizen.')
      return
    }
    setError(null)
    setStep(2)
  }

  const handleNextFromStep2 = () => {
    setError(null)
    setStep(3)
  }

  const handleNextFromStep3 = () => {
    setError(null)
    const today = todayInputValue()
    // Validation
    if (selectedCategory === 'IdentityCredential') {
      if (!hasText(idFullName) || !idDob || !isValidEmail(idEmail)) {
        setError('Please complete all identity claims.')
        return
      }
      if (idDob > today) {
        setError('Date of birth cannot be in the future.')
        return
      }
    } else if (selectedCategory === 'EducationCredential') {
      if (![eduInstitution, eduDegree, eduField].every(hasText) || !eduAwardDate) {
        setError('Please complete all required education claims.')
        return
      }
      if (eduAwardDate > today) {
        setError('Date of award cannot be in the future.')
        return
      }
    } else if (selectedCategory === 'EmploymentCredential') {
      if (!hasText(empEmployer) || !hasText(empJobTitle) || !empType || !empStartDate) {
        setError('Please complete all required employment claims.')
        return
      }
      if (empStartDate > today || (empEndDate && empEndDate < empStartDate)) {
        setError('Check the employment dates. The start date cannot be in the future, and the end date must be on or after the start date.')
        return
      }
    }
    if (expiresAt && expiresAt < today) {
      setError('Expiration date must be today or later.')
      return
    }
    setStep(4)
  }

  const handleIssue = () => {
    setError(null)
    let claims: Record<string, string> = {}
    let title = ''

    if (selectedCategory === 'IdentityCredential') {
      title = 'Identity Credential'
      claims = {
        fullName: idFullName,
        dateOfBirth: idDob,
        email: idEmail,
      }
    } else if (selectedCategory === 'EducationCredential') {
      title = `Degree of ${eduDegree} in ${eduField}`
      claims = {
        institutionName: eduInstitution,
        qualification: eduDegree,
        fieldOfStudy: eduField,
        dateOfAward: eduAwardDate,
        studentName: selectedCitizen?.fullName || '',
      }
    } else {
      title = `${empJobTitle} - Employment Verification`
      claims = {
        employerName: empEmployer,
        jobTitle: empJobTitle,
        employmentType: empType,
        startDate: empStartDate,
        endDate: empEndDate || 'Present',
        employeeName: selectedCitizen?.fullName || '',
      }
    }

    const res = issueCredential({
      organizationId: orgId,
      identityId: selectedCitizenId,
      issuedByUserId: currentUser.id,
      issuedByName: currentUser.name,
      type: selectedCategory,
      title,
      claims,
      ...(expiresAt ? { expiresAt } : {}),
    })

    if (res.ok) {
      setIssuedCredId(res.credential.id)
    } else {
      setError(res.message)
    }
  }

  if (issuedCredId) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-xs text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle weight="fill" className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-[#0F172A] mb-1">
            Credential Issued
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            Credential record created for <strong>{selectedCitizen?.fullName}</strong>.
          </p>

          <PrototypeNotice
            className="mb-6 text-left"
            text="This prototype creates a simulated proof. Real issuer signing and verification will be connected through the backend."
          />

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[#64748B]">Subject DID:</span>
              <span className="font-mono text-slate-800">{selectedCitizen?.did?.slice(0, 20)}...</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[#64748B]">Issuer DID:</span>
              <span className="font-mono text-slate-800">{organization?.did?.slice(0, 20)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Signing Delegate:</span>
              <span className="font-semibold text-[#0F172A]">{currentUser.name}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/im/credentials')}
              className="flex-1 py-2.5 px-4 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#0F172A] text-xs font-semibold rounded-md transition-colors"
            >
              Credentials Registry
            </button>
            <Link
              to={`/im/credentials/${issuedCredId}`}
              className="flex-1 py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors inline-flex items-center justify-center"
            >
              Inspect Issued Credential
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/im/credentials"
        className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
      >
        <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
        <span>Cancel & Return</span>
      </Link>

      {/* 4-Stage Progress Stepper */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className={`p-2 rounded-md ${step === 1 ? 'bg-blue-50 text-[#2563EB] font-bold' : step > 1 ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
            1. Select Citizen
          </div>
          <div className={`p-2 rounded-md ${step === 2 ? 'bg-blue-50 text-[#2563EB] font-bold' : step > 2 ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
            2. Category
          </div>
          <div className={`p-2 rounded-md ${step === 3 ? 'bg-blue-50 text-[#2563EB] font-bold' : step > 3 ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
            3. Fill Claims
          </div>
          <div className={`p-2 rounded-md ${step === 4 ? 'bg-blue-50 text-[#2563EB] font-bold' : 'text-slate-400'}`}>
            4. Review & Sign
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
          <WarningCircle weight="fill" className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* STAGE 1: SELECT CITIZEN */}
      {step === 1 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Stage 1: Select Eligible Citizen</h2>
            <p className="text-xs text-[#64748B]">
              Only citizens who have never received a credential are listed.
            </p>
          </div>

          {eligibleCitizens.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg">
              <User weight="fill" className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#0F172A]">No Eligible Citizens Available</p>
              <p className="text-xs text-[#64748B] mt-1 mb-4">
                All registered citizens under your organization already have their one authorized credential, or no citizens have been registered yet.
              </p>
              <Link
                to="/im/citizens/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md"
              >
                Register New Citizen
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {eligibleCitizens.map((cit) => (
                <label
                  key={cit.id}
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                    selectedCitizenId === cit.id
                      ? 'border-[#2563EB] bg-blue-50/50'
                      : 'border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="citizen"
                      value={cit.id}
                      checked={selectedCitizenId === cit.id}
                      onChange={() => setSelectedCitizenId(cit.id)}
                      className="text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">{cit.fullName}</p>
                      <p className="text-[11px] text-[#64748B]">{cit.email} • DOB: {cit.dateOfBirth}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                    {cit.did?.slice(0, 16)}...
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              disabled={!selectedCitizenId}
              onClick={handleNextFromStep1}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-40"
            >
              <span>Continue to Category</span>
              <ArrowRight weight="bold" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: SELECT CATEGORY */}
      {step === 2 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Stage 2: Select Credential Category</h2>
            <p className="text-xs text-[#64748B]">
              Choose from the three standardized W3C credential templates
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setSelectedCategory('IdentityCredential')}
              className={`p-5 rounded-xl border text-left transition-all ${
                selectedCategory === 'IdentityCredential'
                  ? 'border-[#2563EB] bg-blue-50/50 shadow-xs'
                  : 'border-[#E2E8F0] hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center mb-3">
                <IdentificationCard weight="fill" className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mb-1">Identity</h3>
              <p className="text-[11px] text-[#64748B]">
                Identity claims recorded in the local demo credential.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('EducationCredential')}
              className={`p-5 rounded-xl border text-left transition-all ${
                selectedCategory === 'EducationCredential'
                  ? 'border-[#2563EB] bg-blue-50/50 shadow-xs'
                  : 'border-[#E2E8F0] hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <GraduationCap weight="fill" className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mb-1">Education</h3>
              <p className="text-[11px] text-[#64748B]">
                Academic diplomas, degree awards, and educational qualification records.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('EmploymentCredential')}
              className={`p-5 rounded-xl border text-left transition-all ${
                selectedCategory === 'EmploymentCredential'
                  ? 'border-[#2563EB] bg-blue-50/50 shadow-xs'
                  : 'border-[#E2E8F0] hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <Briefcase weight="fill" className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mb-1">Employment</h3>
              <p className="text-[11px] text-[#64748B]">
                Institutional employment verification, title, and tenure proofs.
              </p>
            </button>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#CBD5E1] text-[#334155] text-xs font-semibold rounded-md hover:bg-slate-50"
            >
              <ArrowLeft weight="bold" className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNextFromStep2}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors"
            >
              <span>Continue to Claims Form</span>
              <ArrowRight weight="bold" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: FILL DETAILS */}
      {step === 3 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Stage 3: Credential Claims</h2>
            <p className="text-xs text-[#64748B]">
              Enter certified claims for subject <strong>{selectedCitizen?.fullName}</strong>
            </p>
          </div>

          {selectedCategory === 'IdentityCredential' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={idFullName}
                  onChange={(e) => setIdFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={idDob}
                  onChange={(e) => setIdDob(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={idEmail}
                  onChange={(e) => setIdEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md"
                />
              </div>
            </div>
          )}

          {selectedCategory === 'EducationCredential' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={eduInstitution}
                  onChange={(e) => setEduInstitution(e.target.value)}
                  placeholder="e.g. National University"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Degree / Qualification *</label>
                <input
                  type="text"
                  required
                  value={eduDegree}
                  onChange={(e) => setEduDegree(e.target.value)}
                  placeholder="e.g. Bachelor of Science"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Field of Study *</label>
                <input
                  type="text"
                  required
                  value={eduField}
                  onChange={(e) => setEduField(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Date of Award *</label>
                <input
                  type="date"
                  required
                  value={eduAwardDate}
                  onChange={(e) => setEduAwardDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md"
                />
              </div>
            </div>
          )}

          {selectedCategory === 'EmploymentCredential' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Employer / Company Name *</label>
                <input
                  type="text"
                  required
                  value={empEmployer}
                  onChange={(e) => setEmpEmployer(e.target.value)}
                  placeholder="e.g. National Health Trust"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Job Title *</label>
                <input
                  type="text"
                  required
                  value={empJobTitle}
                  onChange={(e) => setEmpJobTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Employment Type *</label>
                <select
                  value={empType}
                  onChange={(e) => setEmpType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={empStartDate}
                    onChange={(e) => setEmpStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">End Date (optional)</label>
                  <input
                    type="date"
                    value={empEndDate}
                    onChange={(e) => setEmpEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5" htmlFor="credential-expiration">
              Expiration date (optional)
            </label>
            <input
              id="credential-expiration"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md"
            />
            <p className="mt-1 text-[11px] text-[#64748B]">
              No default duration is applied. Leave blank if this credential should not expire.
            </p>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#CBD5E1] text-[#334155] text-xs font-semibold rounded-md hover:bg-slate-50"
            >
              <ArrowLeft weight="bold" className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNextFromStep3}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors"
            >
              <span>Review Summary</span>
              <ArrowRight weight="bold" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: REVIEW & ISSUE */}
      {step === 4 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Stage 4: Review & Issue</h2>
            <p className="text-xs text-[#64748B]">
              Review the credential details before issuing it.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[#64748B]">Subject Citizen:</span>
              <span className="font-semibold text-[#0F172A]">{selectedCitizen?.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[#64748B]">Subject DID:</span>
              <span className="font-mono text-slate-700">{selectedCitizen?.did}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[#64748B]">Issuing Organization:</span>
              <span className="font-semibold text-[#0F172A]">{organization?.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[#64748B]">Signing Delegate (Operator):</span>
              <span className="font-semibold text-[#0F172A]">{currentUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Credential Category:</span>
              <span className="font-semibold text-[#2563EB]">{selectedCategory}</span>
            </div>
          </div>

          <div className="text-xs text-[#334155]">
            <span className="text-[#64748B]">Expiration date:</span>{' '}
            <span className="font-semibold text-[#0F172A]">{expiresAt || 'No expiration date set'}</span>
          </div>

          <div className="p-4 border border-blue-100 bg-blue-50/40 rounded-lg text-xs text-[#334155] space-y-1">
            <p className="font-semibold text-[#0F172A]">Prototype notice</p>
            <p>This demo records issuance locally and uses simulated proof data; it does not sign with a protected organization key yet.</p>
          </div>

          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#CBD5E1] text-[#334155] text-xs font-semibold rounded-md hover:bg-slate-50"
            >
              <ArrowLeft weight="bold" className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleIssue}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
            >
              <Certificate weight="bold" className="w-4 h-4" />
              <span>Issue Credential</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
