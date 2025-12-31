import React, { forwardRef } from 'react';
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: {
    value: string;
    label: string;
  }[];
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  className = '',
  label,
  error,
  options,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            appearance-none flex h-9 sm:h-10 md:h-11 w-full rounded-md sm:rounded-lg border border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base
            focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent 
            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-700
            transition-all duration-200
            ${error ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-500 dark:text-gray-400">
          <svg className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-[10px] sm:text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});
Select.displayName = 'Select';