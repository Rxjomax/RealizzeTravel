import React, { useState, useMemo } from 'react';
import { Users, Map, DollarSign, TrendingUp, PlaneTakeoff, Bell, X, CheckCircle2, AlertTriangle, Star, UserPlus, Check, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export default function AdminDashboard() {
  const { clients, itineraries, setGlobalAlert, clientAlerts, resolveClientAlert, kpis, updateKpis, feedbacks, clientPayments } = useApp();
  const navigate = useNavigate();

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  
  const [editKpis, setEditKpis] = useState(kpis);
  const [alertMessage, setAlertMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Calculate actual total paid revenue dynamically from payments
  const calculatedPaidRevenue = useMemo(() => {
    return (clientPayments || []).reduce((acc, p) => {
      if (p.isInstallmentPlan && p.installments && p.installments.length > 0) {
        return acc + p.installments.filter(i => i.status === 'PAID').reduce((iAcc, iCurr) => iAcc + iCurr.amount, 0);
      }
      return acc + (p.status === 'PAID' ? p.amount : 0);
    }, 0);
  }, [clientPayments]);

  const displayRevenue = calculatedPaidRevenue > 0 ? calculatedPaidRevenue : kpis.revenue;

  // Assemble notifications list - only active/unresolved SOS alerts
  const { allNotifications, unreadCount } = useMemo(() => {
    const sosNotifications = (clientAlerts || [])
      .filter(alert => !alert.resolved)
      .map(alert => ({
        id: `sos_${alert.id}`,
        rawId: alert.id,
        type: 'sos' as const,
        title: `S.O.S de Emergência`,
        message: `${alert.clientName || alert.clientEmail || 'Cliente'}: ${alert.message}`,
        timestamp: alert.timestamp || new Date().toISOString(),
        isUnread: !readNotifIds.includes(`sos_${alert.id}`),
        resolved: !!alert.resolved,
        icon: AlertTriangle,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600'
      }));

    const feedbackNotifications = (feedbacks || []).slice(0, 5).map((fb, idx) => ({
      id: `fb_${fb.id || idx}`,
      rawId: fb.id,
      type: 'feedback' as const,
      title: `Nova Avaliação de ${fb.clientName || 'Cliente'}`,
      message: `${fb.rating} ★ - "${fb.comment || 'Sem comentário'}"`,
      timestamp: fb.date || new Date().toISOString(),
      isUnread: !readNotifIds.includes(`fb_${fb.id || idx}`),
      resolved: false,
      icon: Star,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    }));

    const clientNotifications = (clients || []).slice(-3).reverse().map(client => ({
      id: `cli_${client.id}`,
      rawId: client.id,
      type: 'client' as const,
      title: `Novo Cliente: ${client.name}`,
      message: `Viagem planejada: ${client.nextTrip || 'Não definida'}`,
      timestamp: new Date().toISOString(),
      isUnread: !readNotifIds.includes(`cli_${client.id}`),
      resolved: false,
      icon: UserPlus,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }));

    const combined = [...sosNotifications, ...feedbackNotifications, ...clientNotifications];
    return {
      allNotifications: combined,
      unreadCount: combined.filter(n => n.isUnread).length
    };
  }, [clientAlerts, feedbacks, clients, readNotifIds]);

  const handleMarkAllRead = () => {
    const allIds = allNotifications.map(n => n.id);
    setReadNotifIds(allIds);
    setToastMessage('Todas as notificações foram marcadas como lidas.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleResolveAlertFromNotif = async (rawId: string, notifId: string) => {
    await resolveClientAlert(rawId);
    setReadNotifIds(prev => [...prev, notifId]);
    setToastMessage('Alerta de emergência marcado como atendido!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertMessage.trim()) return;
    setGlobalAlert(alertMessage);
    setIsAlertModalOpen(false);
    setAlertMessage('');
    setToastMessage('Alerta global enviado para todos os clientes!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleGenerateReport = () => {
    setToastMessage('Relatório de vendas gerado e enviado para seu e-mail.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveKpis = (e: React.FormEvent) => {
    e.preventDefault();
    updateKpis({
      ...editKpis,
      revenue: Number(editKpis.revenue),
      growth: Number(editKpis.growth),
      satisfaction: Number(editKpis.satisfaction)
    });
    setIsKpiModalOpen(false);
    setToastMessage('KPIs atualizados com sucesso!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const stats = [
    { label: 'Clientes Cadastrados', value: clients.length.toString(), change: 'Total na base', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/60' },
    { label: 'Roteiros Gerados', value: itineraries.length.toString(), change: 'Total no sistema', icon: Map, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
    { label: 'Receita Geral', value: `R$ ${displayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: `${kpis.growth > 0 ? '+' : ''}${kpis.growth}% vs último mês`, icon: DollarSign, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-950/60' },
    { label: 'Nível de Satisfação', value: `${kpis.satisfaction} / 5.0`, change: 'Nota média', icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/60' },
  ];

  const recentTrips = itineraries.map(it => ({
    id: it.id,
    client: it.clientName,
    destination: it.destination,
    date: it.startDate,
    status: 'Confirmado'
  })).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-slate-900 dark:text-slate-100">
      <div className="flex justify-between items-center relative">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Visão Geral</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe as métricas da sua agência em tempo real.</p>
        </div>

        {/* Notification Bell & Popover */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm flex items-center justify-center"
            title="Notificações"
          >
            <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-600 text-white text-[11px] font-extrabold px-1.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsNotificationsOpen(false)} 
              />
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <h3 className="font-bold text-sm">Notificações</h3>
                    {unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {unreadCount} novas
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-xs text-slate-300 hover:text-white underline font-medium transition-colors"
                    >
                      Limpar todas
                    </button>
                  )}
                </div>

                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {allNotifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      Nenhuma notificação no momento.
                    </div>
                  ) : (
                    allNotifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={cn(
                          "p-4 transition-colors flex items-start gap-3 relative",
                          notif.isUnread ? "bg-blue-50/40 dark:bg-blue-950/30" : "bg-white dark:bg-slate-900 opacity-70"
                        )}
                      >
                        <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", notif.iconBg, notif.iconColor)}>
                          <notif.icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{notif.title}</p>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{notif.message}</p>

                          {/* Actions */}
                          {notif.type === 'sos' && (
                            <div className="mt-2.5">
                              {!notif.resolved ? (
                                <button
                                  onClick={() => handleResolveAlertFromNotif(notif.rawId, notif.id)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl shadow-sm transition-all flex items-center gap-1 active:scale-95"
                                >
                                  <Check className="w-3.5 h-3.5" /> Marcar como Atendido
                                </button>
                              ) : (
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Atendido
                                </span>
                              )}
                            </div>
                          )}

                          {notif.type === 'feedback' && (
                            <div className="mt-2">
                              <button
                                onClick={() => {
                                  setIsNotificationsOpen(false);
                                  navigate('/admin/feedback');
                                }}
                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" /> Ver avaliações
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
              </div>
              <div className={cn("p-2 rounded-xl", stat.bg, stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className={cn("text-[10px] font-bold mt-2", stat.change.includes('+') ? "text-emerald-600 dark:text-emerald-400" : stat.change.includes('-') ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400")}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Trips Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {clientAlerts.filter(a => !a.resolved).length > 0 && (
            <div className="p-5 bg-red-50/90 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <h3 className="text-red-900 dark:text-red-200 font-extrabold flex items-center gap-2 text-base">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 animate-bounce" /> 
                  Alertas de Emergência Recebidos ({clientAlerts.filter(a => !a.resolved).length} Ativos)
                </h3>
              </div>
              <div className="space-y-3">
                {clientAlerts.filter(a => !a.resolved).map(alert => {
                  const clientMatch = clients.find(c => c.email?.toLowerCase() === alert.clientEmail?.toLowerCase());
                  
                  return (
                    <div 
                      key={alert.id} 
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 ring-2 ring-red-500/10 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{alert.clientName || clientMatch?.name || alert.clientEmail}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 font-bold uppercase tracking-wider">
                            {alert.destination || clientMatch?.nextTrip || 'Em viagem'}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(alert.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{alert.message}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">E-mail de contato: <span className="font-semibold text-slate-800 dark:text-slate-200">{alert.clientEmail}</span></p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => resolveClientAlert(alert.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Marcar como Atendido
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PlaneTakeoff className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
              Próximos Embarques
            </h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">Ver todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Destino</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800">
                {recentTrips.map((trip, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{trip.client}</td>
                    <td className="px-6 py-4 italic">{trip.destination}</td>
                    <td className="px-6 py-4">{trip.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                        trip.status.includes('Em viagem') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                        trip.status.includes('hoje') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                        trip.status.includes('doc') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="bg-slate-900 dark:bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
          <h2 className="text-lg font-bold mb-6 relative z-10">Ações Rápidas</h2>
          <div className="space-y-3 relative z-10">
            <Link to="/admin/create" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex justify-between items-center">
               <span>Criar Novo Roteiro</span>
               <span className="text-xl leading-none">+</span>
            </Link>
            <button 
              onClick={() => setIsAlertModalOpen(true)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-colors text-left border border-white/10"
            >
              Enviar Alerta Global
            </button>
            <button 
              onClick={handleGenerateReport}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-colors text-left border border-white/10"
            >
              Gerar Relatório de Vendas
            </button>
          </div>
        </div>
      </div>

      {/* Global Alert Modal */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Enviar Alerta</h2>
              <button 
                onClick={() => setIsAlertModalOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendAlert} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Mensagem do Alerta</label>
                <textarea 
                  required
                  value={alertMessage}
                  onChange={e => setAlertMessage(e.target.value)}
                  placeholder="Ex: Alerta de voos cancelados na Europa..."
                  rows={4}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400 resize-none"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
              >
                Enviar para Todos
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
