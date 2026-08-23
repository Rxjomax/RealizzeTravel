import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle2, Circle, Search, Plus, CloudRain, Sun, Snowflake } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApp } from '../../context/AppContext';

interface LuggageItem {
  id: string;
  name: string;
  category: string;
  isPacked: boolean;
}

const INITIAL_ITEMS: LuggageItem[] = [
  { id: '1', name: 'Passaporte', category: 'Documentos', isPacked: false },
  { id: '2', name: 'Cartões de Crédito', category: 'Documentos', isPacked: true },
  { id: '3', name: 'Seguro Viagem', category: 'Documentos', isPacked: false },
  { id: '4', name: 'Camisetas', category: 'Roupas', isPacked: false },
  { id: '5', name: 'Calças', category: 'Roupas', isPacked: false },
  { id: '6', name: 'Jaqueta Impermeável', category: 'Roupas (Clima)', isPacked: false },
  { id: '7', name: 'Protetor Solar', category: 'Higiene', isPacked: false },
  { id: '8', name: 'Escova de Dentes', category: 'Higiene', isPacked: true },
  { id: '9', name: 'Carregador Universal', category: 'Eletrônicos', isPacked: false },
];

export default function LuggageChecklistScreen() {
  const { currentUserEmail } = useApp();
  const storageKey = `luggage_items_${currentUserEmail || 'default'}`;

  const [items, setItems] = useState<LuggageItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch (e) {
      return INITIAL_ITEMS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      console.warn("Error saving luggage items:", e);
    }
  }, [items, storageKey]);
  const [search, setSearch] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [activeWeather, setActiveWeather] = useState<'all' | 'rain' | 'sun' | 'cold'>('all');

  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, isPacked: !item.isPacked } : item));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setItems([
      { id: Date.now().toString(), name: newItemName, category: 'Outros', isPacked: false },
      ...items
    ]);
    setNewItemName('');
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) &&
    (activeWeather === 'all' || 
     (activeWeather === 'rain' && item.category.includes('Clima')) ||
     (activeWeather === 'sun' && item.name.toLowerCase().includes('sol')) ||
     (activeWeather === 'cold' && item.name.toLowerCase().includes('jaqueta'))) // Simplified mock logic
  );

  const groupedItems = filteredItems.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, LuggageItem[]>);

  const packedCount = items.filter(i => i.isPacked).length;
  const progress = Math.round((packedCount / items.length) * 100) || 0;

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 px-4 md:px-8 py-6 relative text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Checklist de Bagagem</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Organize seus pertences e não esqueça nada para a viagem.</p>
      </div>

      {/* Progress Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="bg-slate-800 border border-slate-700 p-2.5 rounded-lg inline-block mb-3">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">{progress}% Pronto</h2>
            <p className="text-xs text-slate-400 font-semibold">{packedCount} de {items.length} itens guardados na mala</p>
          </div>
          
          {/* Circular Progress */}
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
              <circle 
                cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * progress) / 100}
                className={cn("transition-all duration-1000 ease-out", progress === 100 ? "text-emerald-400" : "text-blue-500")}
              />
            </svg>
            <div className="absolute flex items-center justify-center">
              {progress === 100 ? <CheckCircle2 className="w-7 h-7 text-emerald-400" /> : <Briefcase className="w-7 h-7 text-blue-400 opacity-50" />}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Filters (Weather) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">Filtros Inteligentes por Clima</h3>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button 
            onClick={() => setActiveWeather('all')}
            className={cn("shrink-0 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all border", activeWeather === 'all' ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700")}
          >
            Todos
          </button>
          <button 
            onClick={() => setActiveWeather('rain')}
            className={cn("shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all border", activeWeather === 'rain' ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700")}
          >
            <CloudRain className="w-3.5 h-3.5 text-blue-500" /> Chuva
          </button>
          <button 
            onClick={() => setActiveWeather('sun')}
            className={cn("shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all border", activeWeather === 'sun' ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700")}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" /> Sol
          </button>
          <button 
            onClick={() => setActiveWeather('cold')}
            className={cn("shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all border", activeWeather === 'cold' ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700")}
          >
            <Snowflake className="w-3.5 h-3.5 text-cyan-500" /> Frio
          </button>
        </div>
      </div>

      {/* Add & Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <form onSubmit={handleAddItem} className="relative">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Plus className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
            placeholder="Adicionar novo item..."
          />
        </form>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
            placeholder="Buscar na mala..."
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, catItems]: [string, LuggageItem[]]) => (
          <div key={category}>
            <h3 className="font-bold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider mb-2.5 px-0.5">{category}</h3>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {catItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center gap-3.5 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left"
                >
                  <div className={cn("shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all", item.isPacked ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600")}>
                    {item.isPacked && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className={cn("font-medium text-xs transition-all", item.isPacked ? "text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600" : "text-slate-900 dark:text-slate-100")}>
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedItems).length === 0 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs text-center text-slate-500 dark:text-slate-400 text-xs font-medium">Nenhum item encontrado.</div>
        )}
      </div>
      </div>
    </div>
  );
}
