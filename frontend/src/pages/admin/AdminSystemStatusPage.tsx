import React, { useState } from 'react'
import {
  Sparkle,
  CheckCircle,
  Warning,
  ArrowsClockwise,
  HardDrives,
  Database,
  Lightning,
  ShieldCheck,
} from '@phosphor-icons/react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { PrototypeNotice } from '@/components/common/PrototypeNotice'

interface BenchmarkEndpoint {
  path: string
  method: string
  targetLatency: number
  measuredLatency: number
  p99Latency: number
  status: 'optimal' | 'warning' | 'breach'
}

const BENCHMARKS: BenchmarkEndpoint[] = [
  {
    path: '/api/v1/verify',
    method: 'POST',
    targetLatency: 150,
    measuredLatency: 38,
    p99Latency: 64,
    status: 'optimal',
  },
  {
    path: '/api/v1/dids/{did}',
    method: 'GET',
    targetLatency: 150,
    measuredLatency: 24,
    p99Latency: 45,
    status: 'optimal',
  },
  {
    path: '/api/v1/credentials/issue',
    method: 'POST',
    targetLatency: 150,
    measuredLatency: 62,
    p99Latency: 88,
    status: 'optimal',
  },
  {
    path: '/api/v1/credentials/{id}',
    method: 'GET',
    targetLatency: 150,
    measuredLatency: 21,
    p99Latency: 35,
    status: 'optimal',
  },
  {
    path: '/api/v1/auth/login',
    method: 'POST',
    targetLatency: 150,
    measuredLatency: 48,
    p99Latency: 72,
    status: 'optimal',
  },
]

export const AdminSystemStatusPage: React.FC = () => {
  const [benchmarks, setBenchmarks] = useState(BENCHMARKS)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setBenchmarks((prev) =>
        prev.map((b) => ({
          ...b,
          measuredLatency: Math.floor(b.measuredLatency + (Math.random() * 8 - 4)),
        })),
      )
      setRefreshing(false)
    }, 400)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            System Performance & API Latency SLA (PRD US-14)
          </h1>
          <p className="text-sm text-slate-500">
            Live benchmark telemetry verifying sub-150ms response latency requirements
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          loading={refreshing}
          icon={<ArrowsClockwise weight="fill" className="w-4 h-4" />}
        >
          Refresh Measurements
        </Button>
      </div>

      <PrototypeNotice text="This page shows prototype status information. No production services or latency benchmarks are being monitored." />

      {/* Services Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              FastAPI REST Gateway
            </span>
            <Badge variant="active">ONLINE</Badge>
          </div>
          <div className="flex items-center gap-2">
            <HardDrives weight="fill" className="w-5 h-5 text-emerald-600" />
            <span className="text-lg font-bold text-slate-900">Python 3.12 / ASGI</span>
          </div>
          <p className="text-[11px] text-slate-500">Docker containerized, Uvicorn workers active</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              PostgreSQL Persistence
            </span>
            <Badge variant="active">HEALTHY</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Database weight="fill" className="w-5 h-5 text-emerald-600" />
            <span className="text-lg font-bold text-slate-900">PostgreSQL 16</span>
          </div>
          <p className="text-[11px] text-slate-500">Relational schema migrations synced</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Redis Resolution Cache
            </span>
            <Badge variant="active">READY</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Lightning weight="fill" className="w-5 h-5 text-emerald-600" />
            <span className="text-lg font-bold text-slate-900">Redis 7.2</span>
          </div>
          <p className="text-[11px] text-slate-500">Cache hit ratio: 94.2%</p>
        </div>
      </div>

      {/* Latency Benchmarks Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Endpoint Latency SLA Measurements
            </h3>
            <p className="text-xs text-slate-500">Target response time: &lt; 150ms</p>
          </div>
          <Badge variant="active">All Endpoints Pass SLA</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">API Endpoint</th>
                <th className="px-5 py-3.5">HTTP Method</th>
                <th className="px-5 py-3.5">Measured Mean Latency</th>
                <th className="px-5 py-3.5">p99 Latency</th>
                <th className="px-5 py-3.5">SLA Target Threshold</th>
                <th className="px-5 py-3.5 text-right">Status Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchmarks.map((b) => (
                <tr key={b.path} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{b.path}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                      {b.method}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-emerald-700 font-bold">
                    {b.measuredLatency} ms
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">
                    {b.p99Latency} ms
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-500">
                    &lt; {b.targetLatency} ms
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle weight="fill" className="w-3.5 h-3.5 text-emerald-600" />
                      SUB-150MS PASS
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
