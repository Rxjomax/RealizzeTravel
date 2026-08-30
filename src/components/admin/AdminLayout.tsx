import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPin, Users, MessageSquare, DollarSign, CheckSquare, Copy, LogOut, Sun, Moon, Plane } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApp } from '../../context/AppContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme, setCurrentUserEmail } = useApp();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setCurrentUserEmail(null);
    navigate('/');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
    { to: '/admin/create', icon: MapPin, label: 'Novo Roteiro' },
    { to: '/admin/clone', icon: Copy, label: 'Duplicar Roteiro' },
    { to: '/admin/crm', icon: Users, label: 'Passageiros (CRM)' },
    { to: '/admin/finance', icon: DollarSign, label: 'Financeiro' },
    { to: '/admin/tasks', icon: CheckSquare, label: 'Tarefas' },
    { to: '/admin/feedback', icon: MessageSquare, label: 'Avaliações' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden w-full transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shrink-0 shadow-xs">
        <div>
          {/* Logo Header */}
          <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
                  Realizze<span className="text-blue-600">Travel</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 block -mt-0.5 tracking-wider">
                  Admin Master
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  )
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
