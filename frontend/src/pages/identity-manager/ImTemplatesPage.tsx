import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  PlusCircle,
  Certificate,
  Code,
} from '@phosphor-icons/react'
import { TEMPLATES } from '@/data/templates'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { JsonViewer } from '@/components/common/JsonViewer'

export const ImTemplatesPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Verifiable Credential Templates
          </h1>
          <p className="text-sm text-slate-500">
            W3C data schemas configured for Identity, Education, and Employment assertions
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/im/issue')}
          icon={<PlusCircle weight="fill" className="w-4 h-4" />}
        >
          Issue with Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selectors */}
        <div className="lg:col-span-1 space-y-3">
          {TEMPLATES.map((tmpl) => {
            const isSelected = tmpl.id === selectedTemplate.id
            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                    {tmpl.name}
                  </h3>
                  <Badge variant={isSelected ? 'blue' : 'neutral'}>{tmpl.type}</Badge>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{tmpl.description}</p>
                <span className="text-[11px] font-semibold text-slate-400">
                  {tmpl.fields.length} Claim Attributes Defined
                </span>
              </div>
            )
          })}
        </div>

        {/* Selected Template Schema Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  {selectedTemplate.name} Schema Specification
                </h3>
                <p className="text-xs text-slate-500 font-mono">Type: {selectedTemplate.type}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/im/issue')}
                icon={<Certificate weight="fill" className="w-4 h-4" />}
              >
                Use this Template
              </Button>
            </div>

            {/* Field Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Claim Key</th>
                    <th className="px-5 py-3">Label</th>
                    <th className="px-5 py-3">Input Type</th>
                    <th className="px-5 py-3">Required</th>
                    <th className="px-5 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedTemplate.fields.map((field) => (
                    <tr key={field.key} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3 font-mono font-semibold text-slate-900">
                        {field.key}
                      </td>
                      <td className="px-5 py-3 text-slate-800">{field.label}</td>
                      <td className="px-5 py-3 font-mono text-slate-500">
                        {field.input || 'text'}
                      </td>
                      <td className="px-5 py-3">
                        {field.required ? (
                          <span className="text-red-600 font-bold">Yes</span>
                        ) : (
                          <span className="text-slate-400">Optional</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-[11px]">
                        {field.hint || (field.options ? `Options: ${field.options.join(', ')}` : '-')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Payload Representation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Sample Credential JSON-LD
            </h3>
            <JsonViewer
              data={{
                '@context': ['https://www.w3.org/2018/credentials/v1', 'https://schema.org'],
                id: `urn:shieldid:demo:${selectedTemplate.id}_sample`,
                type: ['VerifiableCredential', selectedTemplate.type],
                issuer: 'did:web:harbor.registry.example',
                issuanceDate: new Date().toISOString(),
                credentialSubject: Object.fromEntries(
                  selectedTemplate.fields.map((f) => [f.key, `[sample_${f.key}]`]),
                ),
              }}
              title={`${selectedTemplate.type}.schema.json`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
