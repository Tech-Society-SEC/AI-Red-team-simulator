import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50';
  
  const variantClasses = {
    primary: 'bg-primary-gradient text-white shadow-glow hover:scale-105 hover:shadow-glow-lg focus:ring-primary-500',
    secondary: 'border border-gray-500 bg-gray-700 text-gray-200 hover:border-gray-400 hover:bg-gray-600 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-300 hover:bg-white/10 hover:text-white focus:ring-primary-500',
    success: 'bg-success-gradient text-white shadow-md hover:scale-105 focus:ring-success-500',
    warning: 'bg-warning-gradient text-white shadow-md hover:scale-105 focus:ring-warning-500',
    error: 'bg-error-gradient text-white shadow-md hover:scale-105 focus:ring-error-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      ref={ref}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;