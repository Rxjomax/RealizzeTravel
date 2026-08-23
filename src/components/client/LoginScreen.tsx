import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Lock, Mail, ArrowRight, AlertCircle, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { clients, setCurrentUserEmail, theme, toggleTheme } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    
    setTimeout(() => {
      setIsLoading(false);
      const clientMatch = clients.find(c => (c.email || '').trim().toLowerCase() === cleanEmail);
      if (clientMatch) {
        const storedPassword = clientMatch.password || '123456';
        if (cleanPassword !== storedPassword) {
          setErrorMsg('Senha incorreta. Verifique suas credenciais.');
          return;
        }

        if (clientMatch.role === 'ADMIN') {
          localStorage.setItem('userRole', 'ADMIN');
          localStorage.setItem('userEmail', clientMatch.email);
          setCurrentUserEmail(clientMatch.email);
          navigate('/admin/dashboard');
        } else {
          localStorage.setItem('userRole', 'CLIENT');
          localStorage.setItem('userEmail', clientMatch.email);
          setCurrentUserEmail(clientMatch.email);
          navigate('/app/itinerary');
        }
      } else {
        setErrorMsg('E-mail não encontrado. Verifique a digitação ou contate o administrador.');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center px-6 sm:px-12 relative overflow-hidden text-slate-900 dark:text-slate-100 w-full transition-colors duration-200">
      {/* Theme Toggle Button Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2 text-xs font-semibold"
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span>Modo Escuro</span>
            </>
          )}
        </button>
      </div>

      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[50%] bg-blue-100/50 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="z-10 w-full max-w-sm mx-auto space-y-12">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center shadow-xs mb-6 transform -rotate-3">
            <Plane className="w-9 h-9 text-blue-600 dark:text-blue-400 rotate-3" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Bem-vindo(a)</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Sua viagem inesquecível começa aqui.</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="sr-only">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs text-xs font-medium"
                  placeholder="Seu e-mail"
                />
              </div>
            </div>

            <div>
              <label className="sr-only">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs text-xs font-medium"
                  placeholder="Sua senha"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg border border-red-200 dark:border-red-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="font-semibold">{errorMsg}</p>
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <a href="#" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Esqueceu a senha?</a>
          </div>



          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "group relative w-full flex justify-center py-3 px-4 border border-slate-900 dark:border-slate-100 text-xs font-semibold rounded-lg text-white dark:text-slate-900 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white focus:outline-none transition-all shadow-xs",
              isLoading ? "opacity-70 cursor-not-allowed" : "active:translate-y-0.5"
            )}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
              </span>
            ) : (
              <span className="flex items-center tracking-wide">
                Acessar Plataforma
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
