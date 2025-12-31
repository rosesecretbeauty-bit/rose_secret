import React, { forwardRef } from 'react';
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className = '',
  label,
  error,
  helperText,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          flex min-h-[80px] sm:min-h-[100px] md:min-h-[120px] w-full 
          rounded-lg sm:rounded-xl 
          border border-gray-300 dark:border-gray-600 
          bg-white dark:bg-gray-800 
          text-gray-900 dark:text-white
          px-3 sm:px-4 py-2 sm:py-2.5 
          text-xs sm:text-sm md:text-base 
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-600 
          focus:border-transparent 
          disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-700
          transition-all duration-200 resize-y
          ${error ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-600 bg-red-50/30 dark:bg-red-900/10' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});
Textarea.displayName = 'Textarea';