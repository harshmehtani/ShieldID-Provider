import React, { useState } from 'react'
import {
  Gear,
  CheckCircle,
  Warning,
  ArrowsClockwise,
  EnvelopeSimple,
  Buildings,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'

export const AdminSettingsPage: React.FC = () => {
  const { state, updateUserSettings, resetDemoData } = useApp()

  const [defaultOrg, setDefaultOrg] = useState(state.settings.defaultOrganizationId)
  const [requireReview, setRequireReview] = useState(state.settings.requireReviewForRegistration)
  const [supportEmail, setSupportEmail] = useState(state.settings.supportEmail)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateUserSettings({
      defaultOrganizationId: defaultOrg,
      requireReviewForRegistration: requireReview,
      supportEmail,
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          System Configuration & Settings
        </h1>
        <p className="text-sm text-slate-500">
          Global application governance parameters, registration workflows, and test environment controls
        </p>
      </div>

      <PrototypeNotice text="These settings are saved in the current browser demo. They do not change a deployed service or other users’ accounts." />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Governance Settings */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wide">
            <Gear weight="fill" className="w-5 h-5 text-blue-600" />
            <span>Registration & Enrolment Policy</span>
          </div>

          <div className="space-y-4 text-xs">
            <Select
              label="Default Registration Authority Organization"
              value={defaultOrg}
              onChange={(e) => setDefaultOrg(e.target.value)}
              helperText="Organization under which new self-registered citizens are provisioned"
            >
              {state.organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.did})
                </option>
              ))}
            </Select>

            <label className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 block text-xs">
                  Require Identity Manager Approval for Citizen Registrations
                </span>
                <span className="text-[11px] text-slate-500">
                  When enabled, citizen self-registrations enter the "Pending Review" queue before a DID is issued
                </span>
              </div>
              <input
                type="checkbox"
                checked={requireReview}
                onChange={(e) => setRequireReview(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </label>

            <Input
              label="System Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              helperText="Exposed in API documentation and user communications"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={<CheckCircle weight="fill" className="w-4 h-4" />}
            >
              Save Configuration
            </Button>
          </div>
        </div>

        {/* Demo Data Reset Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm uppercase tracking-wide">
            <Warning weight="fill" className="w-5 h-5 text-rose-600" />
            <span>Demonstration Data Reset</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Restore the application state to default initial seeds. This resets all modified organizations, issued credentials, presentation shares, and newly enrolled citizens.
          </p>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={() => setResetConfirmOpen(true)}
              icon={<ArrowsClockwise weight="fill" className="w-4 h-4" />}
            >
              Reset All Demonstration State
            </Button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={resetDemoData}
        title="Reset All Demonstration Records?"
        message="This action will clear all newly registered credentials, presentations, and users, restoring the original demonstration seed data."
        confirmText="Confirm Reset"
        variant="danger"
      />
    </div>
  )
}
