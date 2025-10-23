import React from 'react';
import { clsx } from 'clsx';

const Badge = React.forwardRef(({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}, ref) => {
  const baseClasses = 'badge';
  
  const variantClasses = {
    default: 'badge-gray',
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };
  
  return (
    <span
      ref={ref}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
