import React, { useState, useEffect } from 'react';
import { Camera, Send, BookOpen, Plus, Sparkles, Clock, Trash2, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApp } from '../../context/AppContext';

interface DiaryEntry {
  id: string;
  text: string;
  date: string;
  imageUrl?: string;
}

export default function DiaryScreen() {
  const { currentUserEmail } = useApp();
  const storageKey = `diary_entries_${currentUserEmail || 'default'}`;

  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch (e) {
      console.warn("Error saving diary entries:", e);
    }
  }, [entries, storageKey]);
  
  const [text, setText] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !pendingImage) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      text: text.trim(),
      date: new Date().toISOString(),
      imageUrl: pendingImage || undefined
    };

    setEntries([newEntry, ...entries]);
    setText('');
    setPendingImage(null);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const simulatePhotoTake = () => {
    setPendingImage('https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=600');
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 pb-28 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 rounded-xl text-blue-600 dark:text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Diário de Bordo</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Registre suas impressões e momentos marcantes</p>
            </div>
          </div>
        </div>

        {/* Create Entry Card */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="relative">
            <textarea 
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="O que aconteceu de especial hoje?"
              rows={3}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {pendingImage && (
            <div className="relative inline-block">
              <img src={pendingImage} alt="Anexo" className="h-20 w-28 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
              <button 
                type="button"
                onClick={() => setPendingImage(null)}
                className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={simulatePhotoTake}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all"
            >
              <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Adicionar Foto</span>
            </button>

            <button
              type="submit"
              disabled={!text.trim() && !pendingImage}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar Registro</span>
            </button>
          </div>
        </form>

        {/* Entries Timeline */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhum registro ainda</p>
              <p className="text-xs text-slate-400">Suas anotações e reflexões de viagem aparecerão aqui.</p>
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às {new Date(entry.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <button 
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Excluir anotação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {entry.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-60">
                    <img src={entry.imageUrl} alt="Momento" className="w-full h-full object-cover" />
                  </div>
                )}

                {entry.text && (
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                    {entry.text}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
