import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  loading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  let sizeClasses = 'text-sm px-3.5 py-2 gap-2'
  if (size === 'sm') {
    sizeClasses = 'text-xs px-2.5 py-1.5 gap-1.5'
  } else if (size === 'lg') {
    sizeClasses = 'text-base px-5 py-2.5 gap-2.5'
  }

  let variantClasses = ''
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-blue-800 text-white shadow-xs focus-visible:ring-[#2563EB]'
      break
    case 'secondary':
      variantClasses =
        'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs focus-visible:ring-[#2563EB]'
      break
    case 'destructive':
      variantClasses =
        'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs focus-visible:ring-red-600'
      break
    case 'outline':
      variantClasses =
        'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 focus-visible:ring-[#2563EB]'
      break
    case 'ghost':
      variantClasses =
        'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus-visible:ring-[#2563EB]'
      break
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
      {!loading && iconRight}
    </button>
  )
}
