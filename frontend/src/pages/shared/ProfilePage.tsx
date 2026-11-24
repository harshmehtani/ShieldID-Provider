import React, { useState } from 'react'
import {
  User,
  EnvelopeSimple,
  Phone,
  IdentificationCard,
  Buildings,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { formatDate } from '@/lib/dates'
import { didDocument } from '@/lib/credential'
import { JsonViewer } from '@/components/common/JsonViewer'

export const ProfilePage: React.FC = () => {
  const { currentUser, state, updateUserProfile } = useApp()
  const [phone, setPhone] = useState(currentUser?.phone || '')
  const [saving, setSaving] = useState(false)

  if (!currentUser) return null

  const org = state.organizations.find((o) => o.id === currentUser.organizationId)
  const identity = state.identities.find((i) => i.id === currentUser.identityId || i.userId === currentUser.id)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    updateUserProfile({ phone })
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Account Profile & Identity
        </h1>
        <p className="text-sm text-slate-500">
          Manage your personal details, role assignments, and associated decentralized identifier
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-2xl shadow-xs mb-3">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{currentUser.name}</h3>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            <div className="mt-2.5">
              <Badge variant="blue" dot={true}>
                {currentUser.role.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Account Status</span>
              <Badge variant={currentUser.status}>{currentUser.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Member Since</span>
              <span className="font-medium text-slate-800">{formatDate(currentUser.createdAt)}</span>
            </div>
            {org && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Organization</span>
                <span className="font-medium text-slate-800 truncate max-w-[140px] text-right">
                  {org.name}
                </span>
              </div>
            )}
            {identity?.did && (
              <div className="pt-2">
                <span className="text-slate-500 block mb-1">Subject DID</span>
                <code className="bg-slate-100 text-slate-800 p-1.5 rounded-sm block font-mono text-[11px] break-all border border-slate-200">
                  {identity.did}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings Form & DID Document */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Details */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-1">Personal Details</h3>
            <p className="text-xs text-slate-500 mb-4">
              Update contact information associated with this user session
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={currentUser.name}
                  disabled
                  helperText="Managed by identity authority"
                />
                <Input
                  label="Email Address"
                  value={currentUser.email}
                  disabled
                  helperText="Primary authentication identifier"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98200 11021"
                />
                <Input
                  label="Role"
                  value={currentUser.role.replace('_', ' ').toUpperCase()}
                  disabled
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={saving}
                  icon={<CheckCircle weight="fill" className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Decentralized Identifier Document */}
          {identity?.did && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    W3C DID Document
                  </h3>
                  <p className="text-xs text-slate-500">
                    Demo DID document shown for {identity.did}
                  </p>
                </div>
                <Badge variant="info">Prototype</Badge>
              </div>

              <JsonViewer
                data={didDocument(identity.did)}
                title="did-document.json"
                filename={`${identity.did}.json`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
