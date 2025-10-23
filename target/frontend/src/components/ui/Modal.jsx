import React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, className, ...props }) => {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
        {...props}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={clsx('modal-content', className)}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ModalHeader = React.forwardRef(({
  children,
  className,
  showClose = true,
  onClose,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('flex items-center justify-between p-6 border-b border-white/10', className)}
      {...props}
    >
      <div className="flex-1">
        {children}
      </div>
      {showClose && onClose && (
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      )}
    </div>
  );
});

ModalHeader.displayName = 'ModalHeader';

const ModalTitle = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <h2
      ref={ref}
      className={clsx('text-xl font-semibold text-gray-100', className)}
      {...props}
    >
      {children}
    </h2>
  );
});

ModalTitle.displayName = 'ModalTitle';

const ModalDescription = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <p
      ref={ref}
      className={clsx('text-sm text-gray-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
});

ModalDescription.displayName = 'ModalDescription';

const ModalContent = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
});

ModalContent.displayName = 'ModalContent';

const ModalFooter = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('flex items-center justify-end space-x-3 p-6 border-t border-white/10', className)}
      {...props}
    >
      {children}
    </div>
  );
});

ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter };
