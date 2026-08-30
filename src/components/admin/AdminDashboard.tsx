import React from 'react';
import { Users, MapPin, Star, AlertCircle, Plus, ArrowUpRight, TrendingUp, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { itineraries, clients, feedbacks, globalAlert } = useApp();

  const totalClients = clients.length;
  const totalItineraries = itineraries.length;
  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
    : '5.0';

  const stats = [
    {
      title: 'Roteiros Cadastrados',
      value: totalItineraries,
      sub: `${totalItineraries} viagens gerenciadas`,
      icon: MapPin,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60'
    },
    {
      title: 'Passageiros',
      value: totalClients,
      sub: 'Cadastrados na base',
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60'
    },
    {
      title: 'Avaliação Média',
      value: `${avgRating} ★`,
      sub: `${feedbacks.length} feedbacks recebidos`,
      icon: Star,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/60'
    },
    {
      title: 'Alerta Global',
      value: globalAlert ? 'Ativo' : 'Nenhum',
      sub: globalAlert ? 'Disparado aos clientes' : 'Operação normal',
      icon: AlertCircle,
      color: globalAlert ? 'text-red-500' : 'text-emerald-500',
      bg: globalAlert ? 'bg-red-50 dark:bg-red-950/60' : 'bg-emerald-50 dark:bg-emerald-950/60'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Painel Geral da Agência
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Acompanhe o status das viagens, clientes e feedbacks em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/create')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Roteiro</span>
          </button>
          
          <button
            onClick={() => navigate('/admin/crm')}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Passageiros</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.title}</span>
                <div className={cn("p-2.5 rounded-2xl", stat.bg, stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight block">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-400 font-medium">{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Itineraries Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-2xl text-blue-600 dark:text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Roteiros Recentes</h2>
              <p className="text-xs text-slate-500 font-medium">Viagens cadastradas para acompanhamento</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/create')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Todos</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Título / Destino</th>
                <th className="px-6 py-3.5">Passageiro</th>
                <th className="px-6 py-3.5">Período</th>
                <th className="px-6 py-3.5">Atividades</th>
                <th className="px-6 py-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {itineraries.slice(0, 5).map((it) => (
                <tr key={it.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{it.title || it.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{it.clientName || 'Geral'}</span>
                    <span className="block text-[11px] text-slate-400">{it.clientEmail}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {it.startDate} até {it.endDate}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                      {it.activities?.length || 0} itens
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate('/admin/itineraries')}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Feedbacks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Últimas Avaliações
            </h2>
            <button
              onClick={() => navigate('/admin/feedbacks')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Ver Todas
            </button>
          </div>

          {feedbacks.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Nenhum feedback recebido ainda.</p>
          ) : (
            <div className="space-y-3">
              {feedbacks.slice(0, 3).map((f) => (
                <div key={f.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{f.clientName}</span>
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                      {'★'.repeat(f.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{f.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Alert Quick Status */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Transmissão de Alerta Global
            </h2>
            <button
              onClick={() => navigate('/admin/alerts')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Configurar
            </button>
          </div>

          {globalAlert ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 block">
                Alerta no Ar para Todos os Passageiros
              </span>
              <p className="text-xs font-bold text-red-900 dark:text-red-200 leading-relaxed">
                {globalAlert}
              </p>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum aviso de emergência ativo.</p>
              <p className="text-[11px] text-slate-400">Todos os passageiros estão com operações normais.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
