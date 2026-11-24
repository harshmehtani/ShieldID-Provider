import React from 'react'
import { MagnifyingGlass, XCircle } from '@phosphor-icons/react'
import { Button } from './Button'

export interface FilterOption {
  label: string
  value: string
}

export interface SearchFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  placeholder?: string
  statusFilter?: string
  onStatusChange?: (status: string) => void
  statusOptions?: FilterOption[]
  categoryFilter?: string
  onCategoryChange?: (category: string) => void
  categoryOptions?: FilterOption[]
  categoryLabel?: string
  onReset?: () => void
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search records...',
  statusFilter,
  onStatusChange,
  statusOptions,
  categoryFilter,
  onCategoryChange,
  categoryOptions,
  categoryLabel = 'Type',
  onReset,
}) => {
  const hasFilters = Boolean(
    searchQuery ||
      (statusFilter && statusFilter !== 'all') ||
      (categoryFilter && categoryFilter !== 'all'),
  )

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <MagnifyingGlass weight="fill" className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-md placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            <XCircle weight="fill" className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statusOptions && onStatusChange && (
          <select
            value={statusFilter || 'all'}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-sm bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          >
            <option value="all">All Statuses</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {categoryOptions && onCategoryChange && (
          <select
            value={categoryFilter || 'all'}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="text-sm bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          >
            <option value="all">All {categoryLabel}</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {hasFilters && onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-500 hover:text-slate-800">
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
