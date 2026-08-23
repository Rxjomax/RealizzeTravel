import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Copy, MessageSquare, LogOut, Plane, Users, DollarSign, CheckSquare, AlertTriangle, Sun, Moon, Lock, ShieldAlert, Phone, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MOCK_USER_ADMIN } from '../../data';
import { useApp } from '../../context/AppContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientAlerts, theme, toggleTheme, systemLicense } = useApp();
  const activeAlertsCount = clientAlerts ? clientAlerts.filter((a: any) => !a.resolved).length : 0;
  const isSuperAdmin = localStorage.getItem('userRole') === 'SUPER_ADMIN';
  const isSuspended = systemLicense?.status === 'SUSPENDED' && !isSuperAdmin;

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
    { to: '/admin/create', icon: Plane, label: 'Criar Roteiro' },
    { to: '/admin/clone', icon: Copy, label: 'Clonar Roteiros' },
    { to: '/admin/crm', icon: Users, label: 'CRM de Clientes' },
    { to: '/admin/finance', icon: DollarSign, label: 'Financeiro' },
    { to: '/admin/tasks', icon: CheckSquare, label: 'Tarefas' },
    { to: '/admin/feedback', icon: MessageSquare, label: 'Avaliações' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 select-none font-sans">
        <div className="max-w-lg w-full bg-slate-900 border border-red-800/80 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-red-950/80 border border-red-700/60 rounded-2xl flex items-center justify-center mx-auto text-red-400 shadow-lg shadow-red-900/30">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-black uppercase tracking-wider">
              Acesso Temporariamente Suspenso
            </span>
            <h1 className="text-xl font-black text-white tracking-tight mt-2">
              Licença do Sistema Indisponível
            </h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              {systemLicense?.suspensionReason || 'O acesso ao painel de administração da agência foi suspenso pelo desenvolvedor responsável.'}
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-left space-y-3 text-xs">
            <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              Para reativação e regularização do acesso:
            </div>
            {systemLicense?.contactDevEmail && (
              <div className="flex items-center gap-2.5 text-slate-200">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>E-mail: <strong className="text-white font-mono">{systemLicense.contactDevEmail}</strong></span>
              </div>
            )}
            {systemLicense?.contactDevWhatsapp && (
              <div className="flex items-center gap-2.5 text-slate-200">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: <strong className="text-emerald-400 font-mono">{systemLicense.contactDevWhatsapp}</strong></span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700"
          >
            Voltar para a Tela de Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 dark:bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col hidden md:flex select-none shrink-0">
        <div className="p-6 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">RealizzeTravel</span>
          </div>

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center justify-between px-4 py-3 rounded-xl font-medium active:scale-[0.98] transition-all duration-150 ease-out",
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 scale-[1.01]" 
                  : "hover:bg-slate-800 hover:text-white text-slate-400"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
              {item.to === '/admin/dashboard' && activeAlertsCount > 0 && (
                <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> {activeAlertsCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {localStorage.getItem('userRole') === 'SUPER_ADMIN' && (
            <button
              onClick={() => navigate('/master')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-bold transition-all"
            >
              <span>⚙️ Voltar ao Portal Master</span>
            </button>
          )}

          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{MOCK_USER_ADMIN.name}</p>
              <p className="text-xs text-slate-500 truncate">{MOCK_USER_ADMIN.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors active:scale-95"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-lg">Realizze<span className="text-blue-600 font-medium italic">Travel</span></span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 active:scale-95"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <button onClick={handleLogout} className="text-slate-400 p-1.5 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Tabs Bar */}
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 shadow-xs select-none">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 active:scale-95 transition-all duration-150 ease-out",
                isActive
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm scale-[1.02]"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.to === '/admin/dashboard' && activeAlertsCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ml-1">
                  {activeAlertsCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: [0.25, 1, 0.5, 1] }}
              className="w-full flex-1 flex flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
