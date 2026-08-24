import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  MapPin, 
  DollarSign, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Eye, 
  LogOut, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Database, 
  Server, 
  Code2, 
  Calendar, 
  Sliders, 
  FileText, 
  Smartphone,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuditLog } from '../../types';

export default function DeveloperPortal() {
  const navigate = useNavigate();
  const { 
    auditLogs, 
    clients, 
    itineraries, 
    clientPayments, 
    agencyTasks, 
    clientAlerts,
    feedbacks,
    systemLicense, 
    updateSystemLicense, 
    setCurrentUserEmail,
    theme, 
    toggleTheme 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'SURVEILLANCE' | 'ROTEIROS' | 'CLIENTS' | 'FINANCES' | 'LICENSE'>('SURVEILLANCE');
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState<string>('');
  const [isUpdatingLicense, setIsUpdatingLicense] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form states for license config
  const [licenseForm, setLicenseForm] = useState({
    status: systemLicense.status,
    agencyName: systemLicense.agencyName,
    planName: systemLicense.planName,
    expiresAt: systemLicense.expiresAt,
    monthlyFee: systemLicense.monthlyFee,
    suspensionReason: systemLicense.suspensionReason || 'Mensalidade de software pendente. Entre em contato com o desenvolvedor para desbloqueio.',
    contactDevEmail: systemLicense.contactDevEmail || 'dev@master.com',
    contactDevWhatsapp: systemLicense.contactDevWhatsapp || '+55 (11) 99999-8888',
  });

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setCurrentUserEmail(null);
    navigate('/');
  };

  const handleImpersonate = (role: 'ADMIN' | 'CLIENT', email: string) => {
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', email);
    setCurrentUserEmail(email);
    if (role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/app/itinerary');
    }
  };

  const handleSaveLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingLicense(true);
    try {
      await updateSystemLicense(licenseForm);
      showToast('Configurações de licença e bloqueio atualizadas com sucesso!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingLicense(false);
    }
  };

  const toggleLicenseLock = async () => {
    const newStatus = systemLicense.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setIsUpdatingLicense(true);
    try {
      await updateSystemLicense({ status: newStatus });
      setLicenseForm(prev => ({ ...prev, status: newStatus }));
      showToast(newStatus === 'SUSPENDED' ? '⚠️ Agência BLOQUEADA por inadimplência!' : '✅ Agência REATIVADA com sucesso!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingLicense(false);
    }
  };

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesCategory = 
      logFilter === 'ALL' ||
      (logFilter === 'ITINERARY' && (log.actionType.includes('ITINERARY'))) ||
      (logFilter === 'CLIENT' && (log.actionType.includes('CLIENT'))) ||
      (logFilter === 'PAYMENT' && (log.actionType.includes('PAYMENT'))) ||
      (logFilter === 'TASK' && (log.actionType.includes('TASK'))) ||
      (logFilter === 'SECURITY' && (log.actionType === 'LICENSE_CHANGE' || log.actionType === 'SOS_ALERT'));

    const query = logSearch.toLowerCase();
    const matchesSearch = 
      !query ||
      (log.targetName || '').toLowerCase().includes(query) ||
      (log.details || '').toLowerCase().includes(query) ||
      (log.actionType || '').toLowerCase().includes(query) ||
      (log.userEmail || '').toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  // Calculate total volume
  const totalRevenueLogged = clientPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const agencyClients = clients.filter(c => 
    c.role === 'CLIENT' || 
    (!c.role && c.email !== 'admin@agencia.com' && c.email !== 'dev@master.com')
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-indigo-400/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Top Cockpit Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">PORTAL DO DESENVOLVEDOR</h1>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Painel de Telemetria, Auditoria e Controle de Licença da Agência</p>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${
              systemLicense.status === 'ACTIVE' 
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' 
                : 'bg-red-950/60 border-red-800 text-red-400 animate-pulse'
            }`}>
              <div className={`w-2 h-2 rounded-full ${systemLicense.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span>Licença: {systemLicense.status === 'ACTIVE' ? 'ATIVA (Agência Liberada)' : 'SUSPENSA (Agência Bloqueada)'}</span>
            </div>

            {/* Quick Lock Button */}
            <button
              onClick={toggleLicenseLock}
              disabled={isUpdatingLicense}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                systemLicense.status === 'ACTIVE'
                  ? 'bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title={systemLicense.status === 'ACTIVE' ? 'Clique para suspender/bloquear acesso da agência' : 'Clique para reativar o acesso da agência'}
            >
              {systemLicense.status === 'ACTIVE' ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Bloquear Agência</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Desbloquear Agência</span>
                </>
              )}
            </button>

            {/* Impersonate Admin Shortcut */}
            <button
              onClick={() => handleImpersonate('ADMIN', 'admin@agencia.com')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Ver como Admin</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-red-950/60 hover:text-red-400 border border-slate-700 text-slate-300 transition-all"
              title="Sair do Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Cockpit Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Telemetry Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Licença / Status */}
          <div className={`p-4 rounded-xl border ${
            systemLicense.status === 'ACTIVE' ? 'bg-slate-900 border-slate-800' : 'bg-red-950/40 border-red-900'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Status Agência</span>
              {systemLicense.status === 'ACTIVE' ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-red-400" />}
            </div>
            <div className={`text-xl font-black ${systemLicense.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
              {systemLicense.status === 'ACTIVE' ? 'Acesso Liberado' : 'Bloqueado'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {systemLicense.agencyName}
            </div>
          </div>

          {/* Card 2: Roteiros Criados */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Roteiros Criados</span>
              <MapPin className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{itineraries.length}</div>
            <div className="text-[11px] text-indigo-300 mt-1">
              Pela agência no app
            </div>
          </div>

          {/* Card 3: Clientes Cadastrados */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Passageiros no CRM</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{agencyClients.length}</div>
            <div className="text-[11px] text-blue-300 mt-1">
              Clientes cadastrados
            </div>
          </div>

          {/* Card 4: Faturamento Movimentado */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Volume Financeiro</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              R$ {totalRevenueLogged.toLocaleString('pt-BR')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Lançados na agência
            </div>
          </div>

          {/* Card 5: Atividades Registradas */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total de Ações</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400">{auditLogs.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Logs de auditoria gravados
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('SURVEILLANCE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'SURVEILLANCE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Feed de Auditoria em Tempo Real ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ROTEIROS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'ROTEIROS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Roteiros Criados ({itineraries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CLIENTS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'CLIENTS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Passageiros / CRM ({agencyClients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('FINANCES')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'FINANCES'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Financeiro da Agência ({clientPayments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('LICENSE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'LICENSE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Controle de Licença & Bloqueio</span>
          </button>
        </div>

        {/* Tab 1: Live Surveillance Feed (Audit Logs) */}
        {activeTab === 'SURVEILLANCE' && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'ALL', label: 'Todos os Logs' },
                  { id: 'ITINERARY', label: 'Roteiros' },
                  { id: 'CLIENT', label: 'Clientes CRM' },
                  { id: 'PAYMENT', label: 'Financeiro' },
                  { id: 'TASK', label: 'Tarefas' },
                  { id: 'SECURITY', label: 'Segurança / SOS' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setLogFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      logFilter === cat.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={e => setLogSearch(e.target.value)}
                  placeholder="Buscar ação, cliente, destino..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* Logs Timeline */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
              {filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <Activity className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                  <p className="text-sm font-semibold">Nenhuma atividade registrada com os filtros atuais.</p>
                  <p className="text-xs">Assim que o admin cadastrar um cliente, criar um roteiro ou lançar um valor, aparecerá aqui em tempo real.</p>
                </div>
              ) : (
                filteredLogs.map(log => {
                  const dateObj = new Date(log.timestamp);
                  const formattedDate = dateObj.toLocaleDateString('pt-BR');
                  const formattedTime = dateObj.toLocaleTimeString('pt-BR');

                  const getBadgeColor = () => {
                    switch (log.actionType) {
                      case 'CREATE_ITINERARY':
                        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                      case 'UPDATE_ITINERARY':
                      case 'DELETE_ITINERARY':
                        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                      case 'CREATE_CLIENT':
                        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
                      case 'CREATE_PAYMENT':
                      case 'UPDATE_PAYMENT':
                        return 'bg-green-500/10 text-green-400 border-green-500/30';
                      case 'SOS_ALERT':
                        return 'bg-red-500/20 text-red-400 border-red-500/40';
                      case 'LICENSE_CHANGE':
                        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
                      default:
                        return 'bg-slate-800 text-slate-300 border-slate-700';
                    }
                  };

                  return (
                    <div key={log.id} className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 shrink-0 mt-0.5">
                          {log.actionType.includes('ITINERARY') && <MapPin className="w-4 h-4 text-indigo-400" />}
                          {log.actionType.includes('CLIENT') && <Users className="w-4 h-4 text-blue-400" />}
                          {log.actionType.includes('PAYMENT') && <DollarSign className="w-4 h-4 text-emerald-400" />}
                          {log.actionType.includes('TASK') && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                          {log.actionType.includes('SOS') && <AlertTriangle className="w-4 h-4 text-red-400" />}
                          {log.actionType === 'LICENSE_CHANGE' && <Lock className="w-4 h-4 text-purple-400" />}
                          {log.actionType === 'LOGIN' && <Eye className="w-4 h-4 text-slate-400" />}
                          {log.actionType === 'UPLOAD_DOCUMENT' && <FileText className="w-4 h-4 text-cyan-400" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getBadgeColor()}`}>
                              {log.actionType.replace('_', ' ')}
                            </span>
                            {log.targetName && (
                              <span className="text-xs font-bold text-white">
                                {log.targetName}
                              </span>
                            )}
                          </div>
                          {log.details && (
                            <p className="text-xs text-slate-300 font-medium">
                              {log.details}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span>Executado por: <strong className="text-slate-400">{log.userName}</strong> ({log.userEmail})</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-slate-400">{formattedTime}</div>
                        <div className="text-[10px] font-mono text-slate-600">{formattedDate}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Roteiros Criados */}
        {activeTab === 'ROTEIROS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Roteiros e Pacotes de Viagem Criados pela Agência</h2>
              <span className="text-xs text-slate-400">Total: {itineraries.length} roteiros ativos</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {itineraries.map(iter => (
                <div key={iter.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{iter.title}</h3>
                      <p className="text-xs text-indigo-400 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {iter.destination}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                      {iter.activities?.length || 0} atividades
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-850">
                    <p><strong className="text-slate-400">Passageiro:</strong> {iter.clientName}</p>
                    <p><strong className="text-slate-400">E-mail:</strong> {iter.clientEmail || 'Não informado'}</p>
                    <p><strong className="text-slate-400">Período:</strong> {iter.startDate} até {iter.endDate}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[10px]">ID: {iter.id}</span>
                    <button
                      onClick={() => handleImpersonate('ADMIN', 'admin@agencia.com')}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs flex items-center gap-1"
                    >
                      Inspecionar no Admin
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Passageiros / Clientes */}
        {activeTab === 'CLIENTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Passageiros Cadastrados no CRM da Agência</h2>
              <span className="text-xs text-slate-400">Total: {agencyClients.length} clientes</span>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
              {agencyClients.map(client => (
                <div key={client.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-sm">
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{client.name}</h3>
                      <p className="text-xs text-slate-400">{client.email}</p>
                      {client.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">Nota: "{client.notes}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Status da Viagem</span>
                      <span className="font-semibold text-slate-200">{client.tripStatus || 'Nenhuma'}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Próxima Viagem</span>
                      <span className="font-semibold text-indigo-400">{client.nextTrip || 'Não agendada'}</span>
                    </div>

                    <button
                      onClick={() => handleImpersonate('CLIENT', client.email)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Ver App deste Cliente</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Financeiro da Agência */}
        {activeTab === 'FINANCES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Lançamentos Financeiros Registrados</h2>
                <p className="text-xs text-slate-400">Total movimentado: <strong className="text-emerald-400">R$ {totalRevenueLogged.toLocaleString('pt-BR')}</strong></p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
              {clientPayments.map(pay => (
                <div key={pay.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">{pay.description}</h3>
                    <p className="text-xs text-slate-400">Cliente: <strong className="text-slate-200">{pay.clientName}</strong> | Vencimento: {pay.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-400">R$ {pay.amount.toLocaleString('pt-BR')}</div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      pay.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {pay.status === 'PAID' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Controle de Licença & Bloqueio (Kill Switch) */}
        {activeTab === 'LICENSE' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white">Configuração da Licença do Software</h2>
                  <p className="text-xs text-slate-400">Gerencie a mensalidade, vencimento e trava remota anti-calote.</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-black ${
                  systemLicense.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                }`}>
                  {systemLicense.status === 'ACTIVE' ? 'STATUS: ATIVO' : 'STATUS: BLOQUEADO'}
                </div>
              </div>

              <form onSubmit={handleSaveLicense} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nome da Agência Cliente</label>
                    <input
                      type="text"
                      value={licenseForm.agencyName}
                      onChange={e => setLicenseForm({ ...licenseForm, agencyName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Plano / Contrato</label>
                    <input
                      type="text"
                      value={licenseForm.planName}
                      onChange={e => setLicenseForm({ ...licenseForm, planName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Valor da Mensalidade (R$)</label>
                    <input
                      type="number"
                      value={licenseForm.monthlyFee}
                      onChange={e => setLicenseForm({ ...licenseForm, monthlyFee: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Vencimento da Licença</label>
                    <input
                      type="date"
                      value={licenseForm.expiresAt}
                      onChange={e => setLicenseForm({ ...licenseForm, expiresAt: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Mensagem de Bloqueio Exibida ao Admin (Quando Suspenso)
                  </label>
                  <textarea
                    rows={3}
                    value={licenseForm.suspensionReason}
                    onChange={e => setLicenseForm({ ...licenseForm, suspensionReason: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Ex: Mensalidade de software pendente. Entre em contato com o desenvolvedor para reativação."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Seu E-mail de Desenvolvedor (Cobrança)</label>
                    <input
                      type="email"
                      value={licenseForm.contactDevEmail}
                      onChange={e => setLicenseForm({ ...licenseForm, contactDevEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Seu WhatsApp de Cobrança</label>
                    <input
                      type="text"
                      value={licenseForm.contactDevWhatsapp}
                      onChange={e => setLicenseForm({ ...licenseForm, contactDevWhatsapp: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isUpdatingLicense}
                    className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvar Parâmetros da Licença</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Kill Switch Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-red-400">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <span>Trava Remota (Anti-Calote)</span>
                  </div>
                  <p className="text-xs text-red-300/80 mt-1 leading-relaxed">
                    Se o cliente da agência atrasar o pagamento ou não cumprir o contrato, você pode suspender o acesso do administrador com 1 clique.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status atual:</span>
                    <strong className={systemLicense.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}>
                      {systemLicense.status === 'ACTIVE' ? 'LIBERADO' : 'SUSPENSO'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mensalidade:</span>
                    <strong className="text-white">R$ {systemLicense.monthlyFee?.toFixed(2)}/mês</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Última alteração:</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(systemLicense.updatedAt || Date.now()).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={toggleLicenseLock}
                disabled={isUpdatingLicense}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                  systemLicense.status === 'ACTIVE'
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                {systemLicense.status === 'ACTIVE' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>BLOQUEAR AGÊNCIA IMEDIATAMENTE</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>REATIVAR ACESSO DA AGÊNCIA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
