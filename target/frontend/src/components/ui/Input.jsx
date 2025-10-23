import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const Input = React.forwardRef(({
  className,
  type = 'text',
  error = false,
  icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const baseClasses = 'w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 backdrop-blur-sm';
  const errorClasses = error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : '';
  
  const iconClasses = icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : '';
  
  return (
    <div className="relative">
      {icon && iconPosition === 'left' && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      
      <input
        ref={ref}
        type={type}
        className={clsx(
          baseClasses,
          errorClasses,
          iconClasses,
          className
        )}
        {...props}
      />
      
      {icon && iconPosition === 'right' && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

const Label = React.forwardRef(({
  children,
  className,
  required = false,
  ...props
}, ref) => {
  return (
    <label
      ref={ref}
      className={clsx('block text-sm font-medium text-gray-200 mb-2', className)}
      {...props}
    >
      {children}
      {required && <span className="text-error-500 ml-1">*</span>}
    </label>
  );
});

Label.displayName = 'Label';

const Textarea = React.forwardRef(({
  className,
  error = false,
  ...props
}, ref) => {
  const baseClasses = 'w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 backdrop-blur-sm resize-none';
  const errorClasses = error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : '';
  
  return (
    <textarea
      ref={ref}
      className={clsx(baseClasses, errorClasses, className)}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

const Select = React.forwardRef(({
  children,
  className,
  error = false,
  ...props
}, ref) => {
  const baseClasses = 'w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 backdrop-blur-sm appearance-none';
  const errorClasses = error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : '';
  
  return (
    <div className="relative">
      <select
        ref={ref}
        className={clsx(baseClasses, errorClasses, className)}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
});

Select.displayName = 'Select';

const FormField = ({ children, className, ...props }) => {
  return (
    <div className={clsx('space-y-2', className)} {...props}>
      {children}
    </div>
  );
};

const FormError = ({ children, className, ...props }) => {
  if (!children) return null;
  
  return (
    <div className={clsx('flex items-center text-sm text-error-400', className)} {...props}>
      <AlertCircle className="w-4 h-4 mr-1" />
      {children}
    </div>
  );
};

const FormSuccess = ({ children, className, ...props }) => {
  if (!children) return null;
  
  return (
    <div className={clsx('flex items-center text-sm text-success-400', className)} {...props}>
      <CheckCircle className="w-4 h-4 mr-1" />
      {children}
    </div>
  );
};

export { Input, Label, Textarea, Select, FormField, FormError, FormSuccess };