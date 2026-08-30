import React, { useState } from 'react';
import { Briefcase, CheckCircle2, Circle, Plus, Trash2, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LuggageItem {
  id: string;
  category: 'documentos' | 'roupas' | 'eletronicos' | 'higiene' | 'outros';
  title: string;
  isPacked: boolean;
}

const DEFAULT_ITEMS: LuggageItem[] = [
  { id: '1', category: 'documentos', title: 'Passaporte e RG original', isPacked: false },
  { id: '2', category: 'documentos', title: 'Cartão de crédito habilitado para exterior', isPacked: false },
  { id: '3', category: 'documentos', title: 'Vouchers de hotel e passagens salvas', isPacked: false },
  { id: '4', category: 'documentos', title: 'Apólice do Seguro Viagem', isPacked: false },
  { id: '5', category: 'eletronicos', title: 'Carregador de celular e cabo extra', isPacked: false },
  { id: '6', category: 'eletronicos', title: 'Adaptador universal de tomadas', isPacked: false },
  { id: '7', category: 'eletronicos', title: 'Powerbank (Bateria portátil na mala de mão)', isPacked: false },
  { id: '8', category: 'higiene', title: 'Kit remédios básicos de uso pessoal', isPacked: false },
  { id: '9', category: 'higiene', title: 'Escova e pasta de dente', isPacked: false },
  { id: '10', category: 'roupas', title: 'Casaco quente / corta-vento', isPacked: false },
  { id: '11', category: 'roupas', title: 'Calçados confortáveis para caminhada', isPacked: false },
  { id: '12', category: 'roupas', title: 'Roupas íntimas e meias suficientes', isPacked: false },
];

export default function LuggageChecklistScreen() {
  const [items, setItems] = useState<LuggageItem[]>(() => {
    try {
      const saved = localStorage.getItem('trip_luggage_checklist');
      return saved ? JSON.parse(saved) : DEFAULT_ITEMS;
    } catch {
      return DEFAULT_ITEMS;
    }
  });

  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<LuggageItem['category']>('outros');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const saveItems = (updated: LuggageItem[]) => {
    setItems(updated);
    try {
      localStorage.setItem('trip_luggage_checklist', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const toggleItem = (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, isPacked: !item.isPacked } : item);
    saveItems(updated);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    saveItems(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const newItem: LuggageItem = {
      id: Date.now().toString(),
      title: newItemTitle.trim(),
      category: newItemCategory,
      isPacked: false,
    };

    saveItems([...items, newItem]);
    setNewItemTitle('');
  };

  const resetChecklist = () => {
    if (confirm('Deseja restaurar a lista padrão de itens da mala?')) {
      saveItems(DEFAULT_ITEMS);
    }
  };

  const totalPacked = items.filter(i => i.isPacked).length;
  const progressPct = items.length > 0 ? Math.round((totalPacked / items.length) * 100) : 0;

  const filteredItems = items.filter(i => selectedCategory === 'all' || i.category === selectedCategory);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Checklist de Bagagem
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Organize seus pertences essenciais antes de fechar a mala.
            </p>
          </div>

          <button
            onClick={resetChecklist}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 self-start sm:self-auto px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Lista</span>
          </button>
        </header>

        {/* Progress Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Status da Mala</span>
              </div>
              <span className="text-xs font-extrabold text-white bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                {totalPacked} de {items.length} itens prontos
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">{progressPct}%</div>
              <span className="text-xs text-blue-100 font-medium">
                {progressPct === 100 ? 'Mala 100% pronta! Boa viagem!' : 'Continue conferindo os itens'}
              </span>
            </div>

            <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden p-0.5 border border-white/20">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <h2 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" /> Adicionar Item à Bagagem
          </h2>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input 
              type="text"
              value={newItemTitle}
              onChange={e => setNewItemTitle(e.target.value)}
              placeholder="Ex: Protetor solar, Óculos de sol..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
            />
            
            <select
              value={newItemCategory}
              onChange={e => setNewItemCategory(e.target.value as LuggageItem['category'])}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="documentos">Documentos</option>
              <option value="roupas">Roupas</option>
              <option value="eletronicos">Eletrônicos</option>
              <option value="higiene">Higiene</option>
              <option value="outros">Outros</option>
            </select>

            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-blue-500/20 active:scale-95 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </form>

        {/* Filter Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'documentos', label: 'Documentos' },
            { id: 'eletronicos', label: 'Eletrônicos' },
            { id: 'roupas', label: 'Roupas' },
            { id: 'higiene', label: 'Higiene' },
            { id: 'outros', label: 'Outros' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 cursor-pointer shadow-xs",
                selectedCategory === cat.id
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Item List */}
        <div className="space-y-2">
          {filteredItems.map(item => (
            <article 
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={cn(
                "bg-white dark:bg-slate-900 p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-xs cursor-pointer select-none",
                item.isPacked 
                  ? "border-slate-200/60 dark:border-slate-800/40 bg-slate-50/60 dark:bg-slate-950/40 opacity-60" 
                  : "border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-blue-200"
              )}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  className="shrink-0 p-0.5 text-slate-400"
                  onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }}
                >
                  {item.isPacked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-blue-500" />
                  )}
                </button>
                <div className="truncate">
                  <span className={cn(
                    "text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 block truncate",
                    item.isPacked && "line-through text-slate-400 dark:text-slate-500 font-normal"
                  )}>
                    {item.title}
                  </span>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                    {item.category}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40"
                title="Remover item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
}
