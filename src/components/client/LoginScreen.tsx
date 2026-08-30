import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Lock, Mail, ArrowRight, AlertCircle, Sun, Moon, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { clients, setCurrentUserEmail, theme, toggleTheme, systemLicense } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [licenseBlockedMsg, setLicenseBlockedMsg] = useState<string | null>(null);

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
    setLicenseBlockedMsg(null);
    
    setTimeout(() => {
      setIsLoading(false);
      const clientMatch = clients.find(c => (c.email || '').trim().toLowerCase() === cleanEmail);
      if (clientMatch) {
        const storedPassword = clientMatch.password || '123456';
        if (cleanPassword !== storedPassword) {
          setErrorMsg('Senha incorreta. Verifique suas credenciais.');
          return;
        }

        if (clientMatch.role === 'SUPER_ADMIN') {
          localStorage.setItem('userRole', 'SUPER_ADMIN');
          localStorage.setItem('userEmail', clientMatch.email);
          setCurrentUserEmail(clientMatch.email);
          navigate('/master');
          return;
        }

        if (clientMatch.role === 'ADMIN') {
          if (systemLicense?.status === 'SUSPENDED') {
            setLicenseBlockedMsg(systemLicense.suspensionReason || 'Acesso temporariamente suspenso. Entre em contato com o desenvolvedor do sistema.');
            return;
          }

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
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden selection:bg-blue-500/30">
      {/* Subtle architectural grid & ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Toggle Top Right */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white backdrop-blur-md hover:bg-slate-800 transition-all flex items-center gap-2 text-xs font-semibold"
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-300" />
          )}
        </button>
      </div>

      {/* Centered Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
          {/* Header Brand */}
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/20 border border-blue-400/30">
              <Plane className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Realizze<span className="text-blue-400 font-medium">Travel</span>
              </h1>
              <p className="text-slate-400 text-xs mt-1 font-medium">
                Acesse seus roteiros, vouchers e assistente de viagem
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs font-medium transition-all"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 pl-1 pr-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Senha
                  </label>
                  <span className="text-[10px] text-slate-500">Padrão inicial: 123456</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs font-medium transition-all font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2.5 text-xs text-red-400 bg-red-950/40 p-3.5 rounded-xl border border-red-900/60 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <p className="font-semibold">{errorMsg}</p>
              </div>
            )}

            {licenseBlockedMsg && (
              <div className="space-y-2 text-xs bg-red-950/60 p-4 rounded-xl border border-red-800/80 text-red-300">
                <div className="flex items-center gap-2 font-bold text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>ACESSO SUSPENSO PELO DESENVOLVEDOR</span>
                </div>
                <p className="text-xs text-red-300/90 leading-relaxed">
                  {licenseBlockedMsg}
                </p>
                {systemLicense?.contactDevEmail && (
                  <div className="pt-2 border-t border-red-800/40 text-[11px] text-red-400">
                    <p>Suporte técnico: <strong className="font-mono text-white">{systemLicense.contactDevEmail}</strong></p>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-500/50 shadow-md shadow-blue-900/20 active:scale-[0.99] transition-all cursor-pointer",
                isLoading && "opacity-75 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verificando credenciais...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Clean Quick Credential Hints */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" /> Agência ou Viajante
            </span>
            <span className="text-slate-400 font-mono">v1.2.0 • Realizze</span>
          </div>
        </div>
      </div>
    </div>
  );
}
