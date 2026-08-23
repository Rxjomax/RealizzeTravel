import React, { useState } from 'react';
import { Star, MessageSquareQuote, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export default function FeedbackModule() {
  const { feedbacks } = useApp();
  
  const [filter, setFilter] = useState('Mais recentes');
  
  const sortedFeedbacks = [...feedbacks].sort((a, b) => {
    if (filter === 'Maiores notas') return b.rating - a.rating;
    if (filter === 'Menores notas') return a.rating - b.rating;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const averageRating = feedbacks.length > 0 ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1) : '0.0';

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Avaliações</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-base sm:text-lg">Acompanhe o nível de satisfação dos seus clientes após as viagens.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 dark:border-slate-800 flex flex-col justify-center items-center text-center">
          <div className="text-xs uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-4">NPS Médio</div>
          <div className="text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tighter mb-4">
            {averageRating}<span className="text-2xl text-slate-400 dark:text-slate-500 font-medium tracking-normal">/5</span>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-900">Base: {feedbacks.length} feedbacks</div>
        </div>
        
        <div className="md:col-span-2 bg-slate-900 dark:bg-slate-900 rounded-[2rem] p-8 sm:p-10 text-white shadow-[0_20px_40px_rgb(0,0,0,0.12)] relative overflow-hidden flex flex-col justify-center border border-slate-800">
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-5 mix-blend-overlay">
            <MessageSquareQuote className="w-64 h-64" />
          </div>
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-wide mb-6">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>Alta Performance</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-4 leading-tight text-white">Monitoramento de Qualidade</h3>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              95% dos clientes avaliaram as últimas viagens com notas 4 ou 5 estrelas. Continue o excelente trabalho!
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 dark:border-slate-800 p-6 sm:p-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Feedbacks Recentes</h2>
          <select 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-200 rounded-full focus:ring-4 focus:ring-blue-500/10 focus:border-transparent block py-3 px-6 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors outline-none"
          >
            <option>Mais recentes</option>
            <option>Maiores notas</option>
            <option>Menores notas</option>
          </select>
        </div>
        
        <div className="space-y-12">
          {sortedFeedbacks.map(fb => (
            <div key={fb.id} className="group">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-inner ring-4 ring-slate-100 dark:ring-slate-800">
                    <img src={`https://ui-avatars.com/api/?name=${fb.clientName}&background=f8fafc&color=0f172a&bold=true`} alt={fb.clientName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xl tracking-tight mb-1">{fb.clientName}</h4>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4 opacity-70" /> 
                      {new Date(fb.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={cn(
                        "w-5 h-5",
                        star <= fb.rating ? "fill-amber-400 text-amber-400" : "fill-slate-300 dark:fill-slate-600 text-slate-300 dark:text-slate-600"
                      )} 
                    />
                  ))}
                </div>
              </div>
              
              <div className="sm:ml-[5.25rem] bg-slate-50 dark:bg-slate-800/60 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors duration-300">
                <p className="text-slate-700 dark:text-slate-300 font-medium text-lg leading-relaxed">"{fb.comment}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
