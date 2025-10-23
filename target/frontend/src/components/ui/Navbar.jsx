import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { 
  Settings, 
  LogOut, 
  User, 
  Menu, 
  X,
  Home,
  MessageSquare,
  CreditCard,
  BarChart3,
  Cog
} from 'lucide-react';

const Navbar = React.forwardRef(({
  title,
  user,
  onLogout,
  onSettings,
  className,
  ...props
}, ref) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  return (
    <motion.nav
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx('bg-white/5 backdrop-blur-md border-b border-white/10', className)}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">💰</span>
              </div>
              <h1 className="text-xl font-bold text-gray-100">{title}</h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Welcome, {user?.name || user?.email || 'User'}
              </span>
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-300" />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {onSettings && (
                <button
                  onClick={onSettings}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-400" />
              ) : (
                <Menu className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 py-4"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3 px-4">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-300" />
                </div>
                <span className="text-sm text-gray-400">
                  {user?.name || user?.email || 'User'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 px-4">
                {onSettings && (
                  <button
                    onClick={onSettings}
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Settings</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Logout</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
});

Navbar.displayName = 'Navbar';

const Sidebar = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <aside
      ref={ref}
      className={clsx('w-64 bg-white/5 backdrop-blur-md border-r border-white/10 h-full', className)}
      {...props}
    >
      {children}
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

const SidebarItem = React.forwardRef(({
  children,
  icon,
  active = false,
  onClick,
  className,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={clsx(
        'w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200',
        active
          ? 'bg-primary-gradient text-white shadow-glow'
          : 'text-gray-400 hover:text-gray-200 hover:bg-white/10',
        className
      )}
      {...props}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span className="font-medium">{children}</span>
    </button>
  );
});

SidebarItem.displayName = 'SidebarItem';

export { Navbar, Sidebar, SidebarItem };
