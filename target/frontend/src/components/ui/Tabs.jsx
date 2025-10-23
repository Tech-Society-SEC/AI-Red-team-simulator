import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const Tabs = ({ children, className, ...props }) => {
  return (
    <div className={clsx('w-full', className)} {...props}>
      {children}
    </div>
  );
};

const TabsList = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('flex space-x-1 bg-white/5 p-1 rounded-xl', className)}
      {...props}
    >
      {children}
    </div>
  );
});

TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef(({
  children,
  className,
  value,
  isActive = false,
  icon,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={clsx(
        'flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
        isActive
          ? 'bg-primary-gradient text-white shadow-glow'
          : 'text-gray-400 hover:text-gray-200 hover:bg-white/10',
        className
      )}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
});

TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef(({
  children,
  className,
  value,
  isActive = false,
  ...props
}, ref) => {
  if (!isActive) return null;
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={clsx('mt-6', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
});

TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
