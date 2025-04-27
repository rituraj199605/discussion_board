// src/components/common/TextField.tsx
import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
  label,
  error,
  hint,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  fullWidth = true,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
  
  // Base input classes
  const baseInputClasses = 'block bg-white border rounded-md shadow-sm focus:ring-2 focus:ring-offset-0 focus:outline-none placeholder:text-slate-400';
  
  // Width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Error state
  const errorClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 text-red-900'
    : 'border-slate-300 focus:border-mint-500 focus:ring-mint-500 text-slate-900';
  
  // Icon padding
  const iconPadding = Icon
    ? iconPosition === 'left' ? 'pl-10' : 'pr-10'
    : '';
  
  // Input size
  const inputSize = 'px-3 py-2 text-sm';
  
  // Combined classes
  const inputClasses = `
    ${baseInputClasses}
    ${widthClass}
    ${errorClasses}
    ${iconPadding}
    ${inputSize}
    ${className}
  `;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon size={18} className={error ? 'text-red-400' : 'text-slate-400'} />
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon size={18} className={error ? 'text-red-400' : 'text-slate-400'} />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-red-600" id={`${inputId}-error`}>
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-500" id={`${inputId}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
});

TextField.displayName = 'TextField';

export default TextField;