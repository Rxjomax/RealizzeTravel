import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Wallet, Bookmark, Briefcase, ShieldAlert, AlertTriangle, X, Star, Languages, Sun, Moon, LogOut, Plane } from 'lucide-react';
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
        <div className="bg-red-600 text-white p-4 flex gap-3 items-start absolute top-0 left-0 w-full z-50 shrink-0 shadow-lg animate-in slide-in-from-top-4">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold leading-tight flex-1">{globalAlert}</p>
          <button 
            onClick={() => setGlobalAlert(null)}
            className="text-white/80 hover:text-white transition-colors shrink-0 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header for Mobile */}
      <div className="h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 flex items-center justify-between shrink-0 md:hidden z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-base">
            Realizze<span className="text-blue-600">Travel</span>
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSOSOpen(true)}
            className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 rounded-xl hover:bg-red-100 transition-colors"
            title="Emergência (SOS)"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation (Bottom on Mobile, Left Sidebar on Desktop) */}
      <nav className="md:w-20 lg:w-64 bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-800 flex md:flex-col justify-around md:justify-start items-center md:items-stretch px-2 md:px-3 md:py-6 z-40 absolute md:relative bottom-0 md:bottom-auto w-full md:h-full shrink-0 h-16 md:h-auto select-none shadow-sm">
        
        {/* Desktop Header Brand */}
        <div className="hidden md:flex items-center gap-3 px-3 pb-6 border-b border-slate-200/80 dark:border-slate-800 mb-4">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <span className="hidden lg:block font-extrabold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
            Realizze<span className="text-blue-600">Travel</span>
          </span>
        </div>

        {/* Nav Items */}
        <div className="flex md:flex-col items-center justify-around md:justify-start w-full md:w-auto flex-1 md:gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col md:flex-row items-center justify-center md:justify-start p-2 md:px-3.5 md:py-2.5 rounded-xl text-xs font-semibold md:w-full transition-all duration-150",
                  isActive 
                    ? "text-blue-600 dark:text-blue-400 md:bg-blue-50 md:dark:bg-blue-950/60 shadow-xs" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100"
                )
              }
            >
              <item.icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
              <span className="text-[10px] md:text-xs tracking-tight mt-0.5 md:mt-0 md:ml-3">{item.label}</span>
            </NavLink>
          ))}

          {/* Desktop Footer Actions */}
          <div className="hidden md:flex flex-col gap-1.5 mt-auto pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setIsSOSOpen(true)}
              className="flex items-center px-3.5 py-2.5 w-full rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mr-3 text-red-500" />
              <span className="hidden lg:block">Emergência (SOS)</span>
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center px-3.5 py-2.5 w-full rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 shrink-0 mr-3 text-amber-400" /> : <Moon className="w-4 h-4 shrink-0 mr-3 text-slate-500" />}
              <span className="hidden lg:block">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center px-3.5 py-2.5 w-full rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0 mr-3" />
              <span className="hidden lg:block">Sair da Conta</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={cn("flex-1 overflow-y-auto pb-16 md:pb-0 scroll-smooth bg-slate-50 dark:bg-slate-950 w-full relative transition-colors duration-200", globalAlert && "pt-[60px]")}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
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
