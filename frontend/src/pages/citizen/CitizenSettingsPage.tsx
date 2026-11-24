import React, { useState } from 'react'
import { Gear, Bell, ShieldCheck, CheckCircle } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

export const CitizenSettingsPage: React.FC = () => {
  const { currentUser, updateCitizenPreferences } = useApp()

  const [emailAlerts, setEmailAlerts] = useState(currentUser?.notificationPreferences?.emailAlerts ?? true)
  const [expiryReminders, setExpiryReminders] = useState(currentUser?.notificationPreferences?.expiryReminders ?? true)
  const [shareActivity, setShareActivity] = useState(currentUser?.notificationPreferences?.shareActivity ?? true)
  const [saving, setSaving] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    updateCitizenPreferences({ emailAlerts, expiryReminders, shareActivity })
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Account Settings & Security
        </h1>
        <p className="text-sm text-slate-500">
          Manage your notification alerts, presentation defaults, and session credentials
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Notification Preferences */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wide">
            <Bell weight="fill" className="w-5 h-5 text-blue-600" />
            <span>Notification & Expiry Alerts</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <label className="py-3 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">Credential Issuance Alerts</span>
                <span className="text-slate-500">Receive notifications when an organization issues a new verifiable credential</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="py-3 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">Expiration Reminders</span>
                <span className="text-slate-500">Notify 30 days before any credential is scheduled to expire</span>
              </div>
              <input
                type="checkbox"
                checked={expiryReminders}
                onChange={(e) => setExpiryReminders(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="py-3 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">Presentation Access Tracking</span>
                <span className="text-slate-500">Alert me when a verifier evaluates an active presentation share</span>
              </div>
              <input
                type="checkbox"
                checked={shareActivity}
                onChange={(e) => setShareActivity(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Security & Password */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wide">
            <ShieldCheck weight="fill" className="w-5 h-5 text-blue-600" />
            <span>Authentication Security</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="demo1234"
              disabled
              helperText="Demo accounts use default demo1234"
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            icon={<CheckCircle weight="fill" className="w-4 h-4" />}
          >
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  )
}
