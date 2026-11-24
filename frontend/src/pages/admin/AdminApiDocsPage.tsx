import React, { useState } from 'react'
import {
  Code,
  CheckCircle,
  Copy,
  Check,
  ShieldCheck,
  Play,
} from '@phosphor-icons/react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { JsonViewer } from '@/components/common/JsonViewer'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'

interface ApiEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  summary: string
  description: string
  tags: string[]
  parameters?: { name: string; type: string; required: boolean; description: string }[]
  requestBody?: unknown
  responseSample: unknown
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'ep_auth_login',
    method: 'POST',
    path: '/api/v1/auth/login',
    summary: 'Authenticate user & issue JWT token',
    description: 'Validates user credentials and returns a signed JSON Web Token (JWT) with user roles and organizational scope.',
    tags: ['Authentication'],
    requestBody: {
      email: 'priya.nair@shieldid.demo',
      password: 'demo_secure_password',
    },
    responseSample: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: 'usr_priya',
        name: 'Priya Nair',
        role: 'organization',
        organizationId: 'org_harbor',
      },
    },
  },
  {
    id: 'ep_dids_create',
    method: 'POST',
    path: '/api/v1/dids',
    summary: 'Generate Decentralized Identifier (DID)',
    description: 'Proposed example for a future DID creation endpoint; this prototype currently generates identifiers locally.',
    tags: ['Decentralized Identifiers'],
    requestBody: {
      method: 'did:key',
      identityId: 'idn_aarav',
      keyType: 'Ed25519VerificationKey2020',
    },
    responseSample: {
      did: 'did:key:z6MkdemoAaravShahPublicOnly001',
      didDocument: {
        '@context': ['https://www.w3.org/ns/did/v1'],
        id: 'did:key:z6MkdemoAaravShahPublicOnly001',
        verificationMethod: [
          {
            id: 'did:key:z6MkdemoAaravShahPublicOnly001#key-1',
            type: 'Ed25519VerificationKey2020',
            controller: 'did:key:z6MkdemoAaravShahPublicOnly001',
            publicKeyMultibase: 'z6MkdemoAaravShahPublicOnly001',
          },
        ],
        authentication: ['did:key:z6MkdemoAaravShahPublicOnly001#key-1'],
        assertionMethod: ['did:key:z6MkdemoAaravShahPublicOnly001#key-1'],
      },
    },
  },
  {
    id: 'ep_dids_resolve',
    method: 'GET',
    path: '/api/v1/dids/{did}',
    summary: 'Resolve DID Document',
    description: 'Resolves a Decentralized Identifier against internal registry and external did-resolver drivers.',
    tags: ['Decentralized Identifiers'],
    parameters: [
      { name: 'did', type: 'string', required: true, description: 'Target decentralized identifier to resolve' },
    ],
    responseSample: {
      didDocument: {
        '@context': ['https://www.w3.org/ns/did/v1'],
        id: 'did:web:harbor.registry.example',
        verificationMethod: [
          {
            id: 'did:web:harbor.registry.example#key-1',
            type: 'Ed25519VerificationKey2020',
            controller: 'did:web:harbor.registry.example',
            publicKeyMultibase: 'z6Mkh128HarborIssuerKeyPub',
          },
        ],
      },
      didResolutionMetadata: {
        contentType: 'application/did+ld+json',
        durationMs: 18,
      },
    },
  },
  {
    id: 'ep_credentials_issue',
    method: 'POST',
    path: '/api/v1/credentials/issue',
    summary: 'Issue W3C Verifiable Credential',
    description: 'Proposed example for a future credential issuance endpoint; the current prototype stores a local record with simulated proof data.',
    tags: ['Verifiable Credentials'],
    requestBody: {
      templateId: 'tpl_identity',
      subjectDid: 'did:key:z6MkdemoAaravShahPublicOnly001',
      claims: {
        fullName: 'Aarav Shah',
        dateOfBirth: '1996-04-12',
        residency: 'Harbor Municipal District',
      },
      expiresAt: '2028-12-31T23:59:59.000Z',
    },
    responseSample: {
      credentialId: 'cred_aarav_id',
      verifiableCredential: {
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://schema.org'],
        id: 'urn:shieldid:demo:cred_aarav_id',
        type: ['VerifiableCredential', 'IdentityCredential'],
        issuer: {
          id: 'did:web:harbor.registry.example',
          name: 'Harbor Civic Registry',
        },
        issuanceDate: '2026-01-16T09:30:00.000Z',
        expirationDate: '2028-12-31T23:59:59.000Z',
        credentialSubject: {
          id: 'did:key:z6MkdemoAaravShahPublicOnly001',
          fullName: 'Aarav Shah',
          dateOfBirth: '1996-04-12',
        },
        proof: {
          type: 'Ed25519Signature2020',
          created: '2026-01-16T09:30:00.000Z',
          verificationMethod: 'did:web:harbor.registry.example#key-1',
          proofPurpose: 'assertionMethod',
          proofValue: 'uSIMULATED_cred_aarav_id_PROOF',
        },
      },
    },
  },
  {
    id: 'ep_credentials_verify',
    method: 'POST',
    path: '/api/v1/verify',
    summary: 'Verify Credential Authenticity & Proof',
    description: 'Proposed example for a future verifier endpoint; the current file checker reads structure and declared fields without signature or live registry checks.',
    tags: ['Verification Engine'],
    requestBody: {
      credentialId: 'cred_aarav_id',
    },
    responseSample: {
      verified: true,
      outcome: 'valid',
      summary: 'Sample response only. It does not represent a live credential verification.',
      checks: [
        { id: 'structure', label: 'Credential structure', state: 'pass', detail: 'Required fields present.' },
        { id: 'did_resolution', label: 'DID Resolution', state: 'pass', detail: 'Subject DID resolved.' },
        { id: 'revocation', label: 'Revocation status', state: 'pass', detail: 'Not revoked.' },
        { id: 'expiration', label: 'Expiration', state: 'pass', detail: 'Credential is valid.' },
        { id: 'proof', label: 'Cryptographic proof', state: 'pass', detail: 'Simulated proof matches record.' },
      ],
      benchmarkLatencyMs: 34,
    },
  },
  {
    id: 'ep_credentials_revoke',
    method: 'POST',
    path: '/api/v1/credentials/{id}/revoke',
    summary: 'Revoke Issued Credential',
    description: 'Marks a verifiable credential as revoked in the registry status list. Future verification requests will report status as revoked.',
    tags: ['Verifiable Credentials'],
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Credential unique identifier' },
    ],
    requestBody: {
      reason: 'Change in citizen residential registry status.',
    },
    responseSample: {
      revocationId: 'rev_9021',
      credentialId: 'cred_aarav_id',
      status: 'revoked',
      timestamp: '2026-11-22T04:00:00.000Z',
    },
  },
]

export const AdminApiDocsPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(API_ENDPOINTS[0])
  const [activeTab, setActiveTab] = useState<'response' | 'body' | 'curl'>('response')

  const getMethodBadge = (m: ApiEndpoint['method']) => {
    switch (m) {
      case 'GET':
        return <span className="px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 font-mono font-bold text-[11px]">GET</span>
      case 'POST':
        return <span className="px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">POST</span>
      case 'PUT':
        return <span className="px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 font-mono font-bold text-[11px]">PUT</span>
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded-sm bg-rose-100 text-rose-800 font-mono font-bold text-[11px]">DELETE</span>
    }
  }

  const curlCommand = `curl -X ${selectedEndpoint.method} "https://api.shieldid.example${selectedEndpoint.path}" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>" \\
  -H "Content-Type: application/json"${
    selectedEndpoint.requestBody
      ? ` \\\n  -d '${JSON.stringify(selectedEndpoint.requestBody)}'`
      : ''
  }`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="blue">OpenAPI 3.1 Specification</Badge>
          <Badge variant="active">FastAPI Gateway</Badge>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          ShieldID Provider REST API Explorer
        </h1>
        <p className="text-sm text-slate-500">
          Interactive developer reference for integrating decentralized identity and verifiable credential endpoints
        </p>
      </div>

      <PrototypeNotice text="These are proposed API examples for the future service. The endpoints are not connected to a running backend yet." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoint Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 block mb-2">
            REST Endpoints ({API_ENDPOINTS.length})
          </span>
          {API_ENDPOINTS.map((ep) => {
            const isSelected = ep.id === selectedEndpoint.id
            return (
              <div
                key={ep.id}
                onClick={() => setSelectedEndpoint(ep)}
                className={`p-3 rounded-lg border transition-all cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-400 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {getMethodBadge(ep.method)}
                  <span className="font-mono font-semibold text-slate-900 truncate">
                    {ep.path}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{ep.summary}</p>
              </div>
            )
          })}
        </div>

        {/* Selected Endpoint Documentation Detail */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-6 space-y-5">
            <div className="flex items-center gap-2.5">
              {getMethodBadge(selectedEndpoint.method)}
              <h2 className="text-base font-bold text-slate-900 font-mono">
                {selectedEndpoint.path}
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedEndpoint.description}
            </p>

            {/* Parameters Table if any */}
            {selectedEndpoint.parameters && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  Path & Query Parameters
                </span>
                <table className="w-full text-left text-xs border border-slate-200 rounded-md overflow-hidden">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Parameter</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Required</th>
                      <th className="px-3 py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedEndpoint.parameters.map((p) => (
                      <tr key={p.name}>
                        <td className="px-3 py-2 font-mono font-bold text-slate-800">{p.name}</td>
                        <td className="px-3 py-2 font-mono text-slate-500">{p.type}</td>
                        <td className="px-3 py-2 text-red-600 font-medium">Yes</td>
                        <td className="px-3 py-2 text-slate-600">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tabbed Playground */}
            <div className="pt-2">
              <div className="flex border-b border-slate-200 mb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('response')}
                  className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'response'
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  200 OK Response
                </button>
                {Boolean(selectedEndpoint.requestBody) && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('body')}
                    className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                      activeTab === 'body'
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Request Body Payload
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('curl')}
                  className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'curl'
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  cURL Command
                </button>
              </div>

              {activeTab === 'response' && (
                <JsonViewer
                  data={selectedEndpoint.responseSample}
                  title="200 OK (application/json)"
                />
              )}

              {activeTab === 'body' && Boolean(selectedEndpoint.requestBody) && (
                <JsonViewer
                  data={selectedEndpoint.requestBody}
                  title="application/json Request Body"
                />
              )}

              {activeTab === 'curl' && (
                <div className="rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-200 whitespace-pre overflow-x-auto border border-slate-700">
                  {curlCommand}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
