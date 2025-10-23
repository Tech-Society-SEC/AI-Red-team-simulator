import React from 'react';
import { clsx } from 'clsx';

const Card = React.forwardRef(({
  children,
  className,
  variant = 'default',
  hover = false,
  padding = 'md',
  ...props
}, ref) => {
  const baseClasses = 'rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-soft';
  
  const variantClasses = {
    default: 'bg-white/5 backdrop-blur-sm border border-white/10',
    glass: 'bg-white/5 backdrop-blur-md border border-white/10',
    glassDark: 'bg-black/20 backdrop-blur-md border border-white/5',
    elevated: 'bg-white/10 backdrop-blur-md border border-white/20',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClasses = hover ? 'hover:scale-102 hover:border-white/20 hover:shadow-medium transition-all duration-200' : '';
  
  return (
    <div
      ref={ref}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <h3
      ref={ref}
      className={clsx('text-lg font-semibold text-gray-100', className)}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <p
      ref={ref}
      className={clsx('text-sm text-gray-400', className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('text-gray-300', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('flex items-center pt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };