// src/components/common/Spinner.tsx
import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerVariant = 'primary' | 'secondary' | 'light' | 'dark';

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  fullScreen?: boolean;
  label?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
  fullScreen = false,
  label
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'border-mint-600 border-t-transparent text-mint-600',
    secondary: 'border-peach-300 border-t-transparent text-peach-300',
    light: 'border-white border-t-transparent text-white',
    dark: 'border-slate-700 border-t-transparent text-slate-700'
  };
  
  // Combined classes for the spinner
  const spinnerClasses = `
    inline-block rounded-full animate-spin
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;
  
  // If fullScreen, add a centered container
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className={spinnerClasses}></div>
          {label && (
            <p className="mt-4 text-white font-medium">{label}</p>
          )}
        </div>
      </div>
    );
  }
  
  // With optional label
  if (label) {
    return (
      <div className="flex flex-col items-center">
        <div className={spinnerClasses}></div>
        <p className="mt-2 text-sm text-slate-600">{label}</p>
      </div>
    );
  }
  
  // Basic spinner
  return <div className={spinnerClasses}></div>;
};

export default Spinner;