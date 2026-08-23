import React, { useState } from 'react';
import { Copy, Search, Calendar, User, Save, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MOCK_ACTIVITIES } from '../../data';
import { cn } from '../../lib/utils';

export default function CloneItinerary() {
  const { addItinerary, clients } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const [clientName, setClientName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isCloning, setIsCloning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const templates = [
    { id: 't1', name: 'Europa Clássica (15 dias)', destination: 'Multi-países', difficulty: 'Média' },
    { id: 't2', name: 'Japão Tradicional e Moderno', destination: 'Japão', difficulty: 'Alta' },
    { id: 't3', name: 'Escapada Buenos Aires', destination: 'Argentina', difficulty: 'Baixa' },
  ];

  const handleClone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !clientName || !startDate || !endDate) return;

    setIsCloning(true);
    
    // Simulate cloning delay
    setTimeout(() => {
      const template = templates.find(t => t.id === selectedTemplate);
      const [parsedName, parsedEmail] = clientName.split('|');
      
      const newItinerary = {
        id: `it_${Date.now()}`,
        clientId: `u_${Date.now()}`,
        clientName: parsedName || 'Sem Nome',
        clientEmail: parsedEmail || '',
        title: template?.name || 'Novo Roteiro',
        startDate,
        endDate,
        destination: template?.destination || 'Destino',
        activities: MOCK_ACTIVITIES.map(a => ({ ...a, id: `a_${Date.now()}_${Math.random()}` })),
      };

      addItinerary(newItinerary);

      setIsCloning(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedTemplate(null);
        setClientName('');
        setStartDate('');
        setEndDate('');
        navigate('/admin/dashboard');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Clonar Roteiros</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Selecione um roteiro base e adapte para um novo cliente rapidamente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Templates List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar modelo de roteiro..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {templates.map(template => (
              <div 
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  "p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                  selectedTemplate === template.id 
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40" 
                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800/50"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{template.name}</h3>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-semibold">
                    {template.destination}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Copy className="w-4 h-4 text-blue-500" /> Base pronta para clonar
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Clone Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 h-[600px] flex flex-col">
          {selectedTemplate ? (
            <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Copy className="w-5 h-5 text-blue-600" /> Configurar Novo Roteiro
              </h2>
              
              <form onSubmit={handleClone} className="space-y-5 flex-1">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente (CRM)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <select 
                      required 
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none" 
                    >
                      <option value="" disabled className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">Selecione um cliente...</option>
                      {clients.map(c => (
                        <option key={c.id} value={`${c.name}|${c.email}`} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">{c.name} ({c.email})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Início</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required 
                        type="date" 
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Término</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required 
                        type="date" 
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 mt-auto">
                  <button 
                    type="submit" 
                    disabled={isCloning || isSuccess}
                    className={cn(
                      "w-full py-4 rounded-xl font-medium flex justify-center items-center gap-2 transition-all shadow-sm text-white",
                      isSuccess ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]",
                      isCloning && "opacity-80 cursor-not-allowed"
                    )}
                  >
                    {isCloning ? (
                      <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Clonando...</span>
                    ) : isSuccess ? (
                      <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Roteiro Criado com Sucesso!</span>
                    ) : (
                      <span className="flex items-center gap-2"><Save className="w-5 h-5" /> Gerar Novo Roteiro</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-8">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                <Copy className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-1">Nenhum modelo selecionado</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Selecione um roteiro base na lista ao lado para iniciar a clonagem.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
