import React from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        className={cn(
          'block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'transition-all duration-200',
          error && 'border-red-300 focus:ring-red-500',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helper && !error && (
        <p className="text-sm text-gray-500">{helper}</p>
      )}
    </div>
  )
}

export default Input