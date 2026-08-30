import React from 'react';
import { Heart, MapPin, Share2, Compass, Bookmark } from 'lucide-react';
import { MOCK_TIPS } from '../../data';
import { useApp } from '../../context/AppContext';

export default function LocalTipsScreen() {
  const { itineraries, currentUserEmail, clients } = useApp();
  const [liked, setLiked] = React.useState<Record<string, boolean>>({});

  const effectiveEmail = (currentUserEmail || localStorage.getItem('userEmail') || '').trim().toLowerCase();
  const currentClient = clients.find(c => (c.email || '').trim().toLowerCase() === effectiveEmail);

  // Find user destination
  const userItineraries = itineraries.filter(it => {
    const matchEmail = it.clientEmail && it.clientEmail.trim().toLowerCase() === effectiveEmail;
    const matchName = currentClient?.name && it.clientName && it.clientName.trim().toLowerCase() === currentClient.name.trim().toLowerCase();
    return matchEmail || matchName;
  });
  const activeItinerary = userItineraries[0] || itineraries[0];
  const destinationCity = activeItinerary?.destination || 'Destino';

  const toggleLike = (id: string) => {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 pb-12 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 rounded-xl text-blue-600 dark:text-blue-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dicas e Curadorias Locais</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Recomendações exclusivas para {destinationCity}</p>
            </div>
          </div>
        </div>

        {/* Tips Feed */}
        <div className="space-y-6">
          {MOCK_TIPS.map(tip => (
            <div key={tip.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              {/* Creator Header */}
              <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    RT
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100">Especialista Realizze</p>
                    <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-blue-500" /> {destinationCity}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                  {tip.category}
                </span>
              </div>

              {/* Photo Banner */}
              <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden relative group">
                <img 
                  src={tip.imageUrl} 
                  alt={tip.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Content Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">{tip.title}</h3>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleLike(tip.id)} 
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90 cursor-pointer"
                      title="Favoritar dica"
                    >
                      <Heart className={`w-5 h-5 ${liked[tip.id] ? 'fill-red-500 text-red-500' : 'text-slate-400 dark:text-slate-500'}`} />
                    </button>
                    <button 
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90 text-slate-400 dark:text-slate-500 cursor-pointer"
                      title="Compartilhar dica"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {tip.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
