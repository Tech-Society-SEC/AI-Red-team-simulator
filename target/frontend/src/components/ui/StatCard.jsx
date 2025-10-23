import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const StatCard = React.forwardRef(({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
  ...props
}, ref) => {
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-success-400';
      case 'down':
        return 'text-error-400';
      default:
        return 'text-gray-400';
    }
  };
  
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx('card-hover p-6', className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-100 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={clsx('flex items-center text-sm mt-2', getTrendColor(trend))}>
              <span className="mr-1">{getTrendIcon(trend)}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-primary-gradient rounded-xl flex items-center justify-center text-white text-xl">
              {icon}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

const ProgressBar = React.forwardRef(({
  value,
  max = 100,
  className,
  showLabel = true,
  label,
  color = 'primary',
  size = 'md',
  ...props
}, ref) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    primary: 'bg-primary-gradient',
    success: 'bg-success-gradient',
    warning: 'bg-warning-gradient',
    error: 'bg-error-gradient',
  };
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };
  
  return (
    <div ref={ref} className={clsx('w-full', className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-200">
            {label || `${value}/${max}`}
          </span>
          <span className="text-sm text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={clsx('w-full bg-gray-700 rounded-full overflow-hidden', sizeClasses[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={clsx('h-full rounded-full', colorClasses[color])}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

const RingProgress = React.forwardRef(({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  className,
  children,
  ...props
}, ref) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colorClasses = {
    primary: '#4f46e5',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  };
  
  return (
    <div
      ref={ref}
      className={clsx('relative inline-flex items-center justify-center', className)}
      {...props}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorClasses[color]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
});

RingProgress.displayName = 'RingProgress';

export { StatCard, ProgressBar, RingProgress };
