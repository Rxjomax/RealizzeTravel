import React, { useState, useEffect } from 'react';
import { Camera, Send, MapPin, Image as ImageIcon } from 'lucide-react';
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
  
  // Fake image select for demo
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && !pendingImage) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      text,
      date: new Date().toISOString(),
      imageUrl: pendingImage || undefined
    };

    setEntries([newEntry, ...entries]);
    setText('');
    setPendingImage(null);
  };

  const simulatePhotoTake = () => {
    // Just a mock image for demonstration
    setPendingImage('https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=400');
  };

  return (
    <div className="min-h-full bg-[#fdfbf7] dark:bg-slate-950 flex flex-col relative h-[100dvh] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="px-6 pt-12 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif">Diário de Bordo</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm italic mt-1">Guarde suas memórias.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-40 space-y-8">
        {entries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 text-slate-500 dark:text-slate-400">
            <MapPin className="w-12 h-12 mb-4" />
            <p className="font-serif italic text-lg">Como foi o seu dia hoje?</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-[-2rem] before:w-px before:bg-slate-200 dark:before:bg-slate-800 last:before:bottom-0">
              <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-sm" />
              
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wider">
                  {new Date(entry.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                  {' • '}
                  {new Date(entry.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                {entry.imageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner">
                    <img src={entry.imageUrl} alt="Memory" className="w-full h-auto object-cover" />
                  </div>
                )}
                
                {entry.text && (
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-serif text-lg">
                    "{entry.text}"
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-20 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 pb-8 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        {pendingImage && (
          <div className="relative inline-block mb-3">
            <img src={pendingImage} alt="Pending" className="h-16 w-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
            <button 
              onClick={() => setPendingImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
            >
              ×
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-end overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <textarea 
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Escreva sobre hoje..."
              className="w-full bg-transparent resize-none p-3 max-h-32 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              rows={1}
            />
            <button 
              type="button" 
              onClick={simulatePhotoTake}
              className="p-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <button 
            type="submit"
            disabled={!text && !pendingImage}
            className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
