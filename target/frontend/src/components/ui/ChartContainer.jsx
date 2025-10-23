import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const ChartContainer = React.forwardRef(({
  children,
  title,
  subtitle,
  className,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx('chart-container', className)}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-gray-100 mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-400">{subtitle}</p>
          )}
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
});

ChartContainer.displayName = 'ChartContainer';

const LoadingSkeleton = React.forwardRef(({
  className,
  lines = 1,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={clsx('animate-pulse', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'skeleton mb-2',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
          style={{ height: '1rem' }}
        />
      ))}
    </div>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

const EmptyState = React.forwardRef(({
  icon,
  title,
  description,
  action,
  className,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={clsx('text-center py-12', className)}
      {...props}
    >
      {icon && (
        <div className="text-6xl mb-4 opacity-50">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </motion.div>
  );
});

EmptyState.displayName = 'EmptyState';

const Divider = React.forwardRef(({
  className,
  orientation = 'horizontal',
  ...props
}, ref) => {
  const orientationClasses = {
    horizontal: 'w-full h-px',
    vertical: 'h-full w-px',
  };
  
  return (
    <div
      ref={ref}
      className={clsx(
        'bg-white/10',
        orientationClasses[orientation],
        className
      )}
      {...props}
    />
  );
});

Divider.displayName = 'Divider';

export { ChartContainer, LoadingSkeleton, EmptyState, Divider };
