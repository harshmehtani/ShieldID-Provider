import React, { useState } from 'react'
import { Copy, Check, DownloadSimple } from '@phosphor-icons/react'
import { Button } from './Button'

export interface JsonViewerProps {
  data: unknown
  title?: string
  initialExpanded?: boolean
  maxHeight?: string
  filename?: string
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  title = 'JSON Document',
  maxHeight = 'max-h-96',
  filename = 'document.json',
}) => {
  const [copied, setCopied] = useState(false)
  const jsonString = JSON.stringify(data, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-900 text-slate-100 overflow-hidden text-xs">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/60">
        <span className="font-mono text-slate-300 font-medium">{title}</span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-slate-300 hover:text-white hover:bg-slate-700/60 !py-1 !px-2"
            icon={copied ? <Check weight="fill" className="w-3.5 h-3.5 text-emerald-400" /> : <Copy weight="fill" className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-slate-300 hover:text-white hover:bg-slate-700/60 !py-1 !px-2"
            icon={<DownloadSimple weight="fill" className="w-3.5 h-3.5" />}
          >
            Save
          </Button>
        </div>
      </div>
      <pre className={`p-4 font-mono overflow-auto ${maxHeight} text-slate-200 leading-relaxed select-text whitespace-pre`}>
        <code>{jsonString}</code>
      </pre>
    </div>
  )
}
