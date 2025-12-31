import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  return (
    <div className="w-full group">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-charcoal-700 dark:text-gray-300 mb-1 sm:mb-1.5 ml-1 transition-colors group-focus-within:text-rose-600">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-rose-500 transition-colors">
            <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
              {leftIcon}
            </div>
          </div>
        )}

        <input
          ref={ref}
          className={`
            flex h-9 sm:h-10 md:h-11 w-full rounded-lg sm:rounded-xl 
            border border-gray-200 dark:border-gray-600 
            bg-white/50 dark:bg-gray-800/50 
            px-3 sm:px-4 py-2 
            text-xs sm:text-sm md:text-base 
            text-charcoal-900 dark:text-white 
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            shadow-sm transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/50 
            focus:border-rose-400 dark:focus:border-rose-500 
            focus:bg-white dark:focus:bg-gray-800
            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-700
            ${leftIcon ? 'pl-8 sm:pl-10 md:pl-12' : ''}
            ${rightIcon ? 'pr-8 sm:pr-10 md:pr-12' : ''}
            ${error ? 'border-red-300 dark:border-red-500 focus:border-red-500 dark:focus:border-red-600 focus:ring-red-100 dark:focus:ring-red-900/50 bg-red-50/30 dark:bg-red-900/10' : ''}
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
              {rightIcon}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 ml-1 text-[10px] sm:text-xs text-red-500 dark:text-red-400 font-medium"
          >
            <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
            <span className="break-words">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {helperText && !error && (
        <p className="mt-1 sm:mt-1.5 ml-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});
Input.displayName = 'Input';