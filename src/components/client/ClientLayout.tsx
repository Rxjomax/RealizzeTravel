import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Wallet, Bookmark, Briefcase, ShieldAlert, AlertTriangle, X, Star, Languages, Sun, Moon, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import SOSModal from './SOSModal';
import { useApp } from '../../context/AppContext';

export default function ClientLayout() {
  const [isSOSOpen, setIsSOSOpen] = React.useState(false);
  const { globalAlert, setGlobalAlert, theme, toggleTheme, currentUserEmail, setCurrentUserEmail } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setCurrentUserEmail(null);
    navigate('/');
  };

  const navItems = [
    { to: '/app/itinerary', icon: Map, label: 'Roteiro' },
    { to: '/app/vault', icon: Bookmark, label: 'Cofre' },
    { to: '/app/budget', icon: Wallet, label: 'Gastos' },
    { to: '/app/phrases', icon: Languages, label: 'Tradutor' },
    { to: '/app/luggage', icon: Briefcase, label: 'Bagagem' },
    { to: '/app/feedback', icon: Star, label: 'Avaliar' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative flex flex-col md:flex-row h-[100dvh] overflow-hidden text-slate-900 dark:text-slate-100 w-full transition-colors duration-200">
      {/* Global Alert Banner */}
      {globalAlert && (
        <div className="bg-red-500 text-white p-4 flex gap-3 items-start absolute top-0 left-0 w-full z-50 shrink-0">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-bold leading-tight flex-1">{globalAlert}</p>
          <button 
            onClick={() => setGlobalAlert(null)}
            className="text-white/80 hover:text-white transition-colors shrink-0 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Top Header with Theme Switcher & Logout for Mobile */}
      <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0 md:hidden z-30">
        <span className="font-bold text-xs tracking-wide text-slate-900 dark:text-slate-100">
          Realizze<span className="text-blue-600 dark:text-blue-400">Travel</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSOSOpen(true)}
            className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-md border border-red-200 dark:border-red-900 text-xs font-bold"
            title="Emergência (SOS)"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all text-xs flex items-center gap-1 font-semibold"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Sair da Conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation (Bottom on Mobile, Left Sidebar on Desktop) */}
      <nav className="md:w-20 lg:w-64 bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-800 flex md:flex-col justify-around md:justify-start items-center md:items-stretch px-4 md:px-0 md:pt-6 z-40 absolute md:relative bottom-0 md:bottom-auto w-full md:h-full shrink-0 h-16 md:h-auto select-none">
        
        {/* Desktop Header Brand */}
        <div className="hidden md:flex items-center justify-between px-4 pb-6 border-b border-slate-200 dark:border-slate-800 mb-2">
          <span className="font-bold text-sm tracking-wide text-slate-900 dark:text-slate-100">
            Realizze<span className="text-blue-600 dark:text-blue-400">Travel</span>
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex md:flex-col items-center justify-around md:justify-start w-full md:w-auto flex-1 md:flex-none md:gap-2 md:px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start p-2 md:px-3 md:py-2.5 rounded-lg text-xs font-semibold md:w-full border active:scale-95 transition-all duration-150 ease-out",
                  isActive 
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs scale-[1.02]" 
                    : "text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                )
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block ml-3 text-xs">{item.label}</span>
            </NavLink>
          ))}

          {/* Desktop SOS Button */}
          <button
            onClick={() => setIsSOSOpen(true)}
            className="hidden md:flex flex-row items-center justify-center md:justify-start px-3 py-2.5 mt-auto mb-2 w-full rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/60 font-semibold text-xs active:scale-95 transition-all"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 mr-2" />
            <span className="hidden lg:block">Emergência (SOS)</span>
          </button>

          {/* Desktop Logout Button */}
          <button
            onClick={handleLogout}
            className="hidden md:flex flex-row items-center justify-center md:justify-start px-3 py-2 w-full rounded-lg text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0 mr-2" />
            <span className="hidden lg:block">Sair da Conta</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area with Fluid Motion Transition */}
      <main className={cn("flex-1 overflow-y-auto pb-16 md:pb-0 scroll-smooth bg-slate-50 dark:bg-slate-950 w-full relative transition-colors duration-200", globalAlert && "pt-[60px]")}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: [0.25, 1, 0.5, 1] }}
            className="min-h-full w-full flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* SOS Modal */}
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </div>
  );
}
