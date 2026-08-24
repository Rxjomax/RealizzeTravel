import React from 'react';
import { Heart, MapPin, Share2 } from 'lucide-react';
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
    <div className="min-h-full bg-slate-100 dark:bg-slate-950 pb-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="bg-white dark:bg-slate-900 px-6 pt-12 pb-6 sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Dicas Locais</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Recomendações exclusivas para {destinationCity}.</p>
      </div>

      <div className="mt-4 space-y-6">
        {MOCK_TIPS.map(tip => (
          <div key={tip.id} className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 sm:border-x sm:rounded-2xl sm:mx-4 overflow-hidden shadow-xs">
            {/* User Header */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src="https://ui-avatars.com/api/?name=Agência&background=2563eb&color=fff" alt="Agência" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">Guia Especialista</p>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1">
                  <MapPin className="w-3 h-3 text-blue-500" /> {destinationCity}
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <img 
                src={tip.imageUrl} 
                alt={tip.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Action Bar */}
            <div className="p-4 pb-2 flex gap-4">
              <button onClick={() => toggleLike(tip.id)} className="transition-transform active:scale-75">
                <Heart className={`w-7 h-7 ${liked[tip.id] ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-300'}`} />
              </button>
              <button className="transition-transform active:scale-75">
                <Share2 className="w-7 h-7 text-slate-700 dark:text-slate-300" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-5">
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{tip.title}</p>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {tip.description}
              </p>
              <div className="mt-3 inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2 py-1 rounded-md">
                #{tip.category.toLowerCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
