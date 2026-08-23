import React, { useState } from 'react';
import { Plus, Trash2, Calendar, MapPin, Clock, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Activity, Itinerary } from '../../types';
import { cn } from '../../lib/utils';

export default function CreateItineraryScreen() {
  const { addItinerary, clients } = useApp();
  const navigate = useNavigate();

  const [clientName, setClientName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [activities, setActivities] = useState<Partial<Activity>[]>([
    { id: Date.now().toString(), title: '', date: '', time: '', location: '', description: '', isCompleted: false, mapLink: '' }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleAddActivity = () => {
    setActivities([
      ...activities, 
      { id: Date.now().toString(), title: '', date: '', time: '', location: '', description: '', isCompleted: false, mapLink: '' }
    ]);
  };

  const handleRemoveActivity = (id: string) => {
    if (activities.length > 1) {
      setActivities(activities.filter(a => a.id !== id));
    }
  };

  const updateActivity = (id: string, field: keyof Activity, value: string) => {
    setActivities(activities.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      const [parsedName, parsedEmail] = clientName.split('|');

      const newItinerary: Itinerary = {
        id: `it_${Date.now()}`,
        clientId: `u_${Date.now()}`,
        clientName: parsedName || 'Sem Nome',
        clientEmail: parsedEmail || '',
        title: `Roteiro: ${destination}`,
        destination,
        startDate,
        endDate,
        activities: activities as Activity[], // Assumes all fields filled
      };

      addItinerary(newItinerary);
      navigate('/admin/dashboard');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16 text-slate-900 dark:text-slate-100">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Criar Roteiro</h1>
          <p className="text-slate-400 dark:text-slate-400 font-medium text-lg">Desenvolva o cronograma completo do cliente.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        {/* Info Geral */}
        <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 dark:border-slate-800 space-y-8">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Informações Principais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-4">Cliente (CRM)</label>
              <select 
                required 
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all cursor-pointer"
              >
                <option value="" disabled className="dark:bg-slate-900">Selecione um cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={`${c.name}|${c.email}`} className="dark:bg-slate-900">{c.name} ({c.email})</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-4">Destino</label>
              <input 
                required 
                type="text" 
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Ex: Paris, França"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-4">Data de Início</label>
              <input 
                required 
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-4">Data de Retorno</label>
              <input 
                required 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Cronograma */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Cronograma de Atividades</h2>
            <button 
              type="button"
              onClick={handleAddActivity}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 px-4 py-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Adicionar Atividade
            </button>
          </div>

          <div className="space-y-6">
            {activities.map((act, index) => (
              <div key={act.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-50 dark:border-slate-800 relative group">
                {activities.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => handleRemoveActivity(act.id as string)}
                    className="absolute top-6 right-6 w-10 h-10 bg-red-50 dark:bg-red-950/50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Atividade {index + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-12">
                    <input 
                      required 
                      type="text" 
                      value={act.title}
                      onChange={e => updateActivity(act.id as string, 'title', e.target.value)}
                      placeholder="Título (ex: Visita ao Museu do Louvre)"
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-extrabold text-lg text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="md:col-span-4 relative">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      required 
                      type="date" 
                      value={act.date}
                      onChange={e => updateActivity(act.id as string, 'date', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all"
                    />
                  </div>

                  <div className="md:col-span-3 relative">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Clock className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      required 
                      type="time" 
                      value={act.time}
                      onChange={e => updateActivity(act.id as string, 'time', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all"
                    />
                  </div>

                  <div className="md:col-span-5 relative">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <MapPin className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      required 
                      type="text" 
                      value={act.location}
                      onChange={e => updateActivity(act.id as string, 'location', e.target.value)}
                      placeholder="Localização"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="md:col-span-12">
                    <textarea 
                      required 
                      value={act.description}
                      onChange={e => updateActivity(act.id as string, 'description', e.target.value)}
                      placeholder="Detalhes e dicas da atividade..."
                      rows={3}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  <div className="md:col-span-12">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <MapPin className="w-4 h-4 text-slate-400" />
                      </div>
                      <input 
                        type="url" 
                        value={act.mapLink}
                        onChange={e => updateActivity(act.id as string, 'mapLink', e.target.value)}
                        placeholder="Link do Google Maps (opcional)"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold rounded-full transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-70"
        >
          {isSaving ? (
            <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Save className="w-5 h-5" /> Publicar Roteiro e Cronograma
            </>
          )}
        </button>
      </form>
    </div>
  );
}
