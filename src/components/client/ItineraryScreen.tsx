import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, CheckCircle2, Circle, Navigation, CloudRain, Clock, Calendar as CalendarIcon, Sun, Cloud, CloudSnow, CloudLightning, Wind, Droplets, Plane } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { useApp } from '../../context/AppContext';
import { Activity } from '../../types';

interface LiveWeather {
  temp: number;
  desc: string;
  max: number;
  min: number;
  humidity: number;
  wind: number;
  icon: React.ElementType;
}

export default function ItineraryScreen() {
  const { itineraries, currentUserEmail, clients } = useApp();
  
  // Find logged in client data
  const effectiveEmail = currentUserEmail || localStorage.getItem('userEmail') || '';
  const currentClient = clients.find(c => 
    (c.email || '').trim().toLowerCase() === effectiveEmail.trim().toLowerCase()
  );

  // Find all itineraries assigned to this user (by email, by client name, or by client ID)
  const userItineraries = useMemo(() => {
    if (!effectiveEmail && !currentClient) return itineraries;
    const cleanUserEmail = effectiveEmail.trim().toLowerCase();
    const cleanUserName = (currentClient?.name || '').trim().toLowerCase();
    const clientId = currentClient?.id || '';

    const matched = itineraries.filter(it => {
      const matchEmail = it.clientEmail && it.clientEmail.trim().toLowerCase() === cleanUserEmail;
      const matchName = cleanUserName && it.clientName && it.clientName.trim().toLowerCase() === cleanUserName;
      const matchId = clientId && it.clientId && it.clientId === clientId;
      return matchEmail || matchName || matchId;
    });

    // If user has specific itineraries, sort newest first (by id timestamp or startDate)
    if (matched.length > 0) {
      return [...matched].sort((a, b) => {
        // Priority to client's nextTrip in CRM
        const isANext = currentClient?.nextTrip && a.destination?.toLowerCase().includes(currentClient.nextTrip.toLowerCase());
        const isBNext = currentClient?.nextTrip && b.destination?.toLowerCase().includes(currentClient.nextTrip.toLowerCase());
        if (isANext && !isBNext) return -1;
        if (!isANext && isBNext) return 1;

        // Otherwise latest ID / date
        return (b.id || '').localeCompare(a.id || '') || (b.startDate || '').localeCompare(a.startDate || '');
      });
    }

    // If no direct match found (e.g. preview mode or admin viewing app), return all itineraries
    return itineraries;
  }, [itineraries, effectiveEmail, currentClient]);

  const [selectedItineraryId, setSelectedItineraryId] = useState<string>('');

  // Default to the first (newest) user itinerary if not set or invalid
  const activeItinerary = useMemo(() => {
    if (selectedItineraryId) {
      const found = userItineraries.find(it => it.id === selectedItineraryId);
      if (found) return found;
    }
    return userItineraries.length > 0 ? userItineraries[0] : itineraries[0];
  }, [selectedItineraryId, userItineraries, itineraries]);

  useEffect(() => {
    if (userItineraries.length > 0 && (!selectedItineraryId || !userItineraries.some(i => i.id === selectedItineraryId))) {
      setSelectedItineraryId(userItineraries[0].id);
    }
  }, [userItineraries, selectedItineraryId]);
  
  const [activities, setActivities] = useState<Activity[]>(activeItinerary?.activities || []);
  const [weather, setWeather] = useState<LiveWeather>({
    temp: 21,
    desc: 'Ensolarado',
    max: 24,
    min: 15,
    humidity: 58,
    wind: 12,
    icon: Sun
  });
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [now, setNow] = useState(new Date());
  const [destinationTimezone, setDestinationTimezone] = useState<string>('America/Santiago');
  const [timezoneAbbr, setTimezoneAbbr] = useState<string>('Local');

  // Timer to update local clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper for weather icons and portuguese text based on Open-Meteo codes
  const getWeatherInfo = (code: number) => {
    switch (code) {
      case 0: return { desc: 'Céu Limpo', icon: Sun };
      case 1:
      case 2: return { desc: 'Parcialmente Nublado', icon: Cloud };
      case 3: return { desc: 'Nublado', icon: Cloud };
      case 45:
      case 48: return { desc: 'Neblina', icon: Cloud };
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65: return { desc: 'Chuva Leve', icon: CloudRain };
      case 80:
      case 81:
      case 82: return { desc: 'Pancadas de Chuva', icon: CloudRain };
      case 71:
      case 73:
      case 75: return { desc: 'Neve', icon: CloudSnow };
      case 95:
      case 96:
      case 99: return { desc: 'Tempestade', icon: CloudLightning };
      default: return { desc: 'Ensolarado', icon: Sun };
    }
  };

  // Helper to resolve city query for countries/cities
  const resolveCityQuery = (dest: string) => {
    const clean = dest.split(',')[0].trim();
    const lower = clean.toLowerCase();
    if (lower === 'japão' || lower === 'japao' || lower === 'japan') return 'Tóquio';
    if (lower === 'itália' || lower === 'italia' || lower === 'italy') return 'Roma';
    if (lower === 'frança' || lower === 'franca' || lower === 'france') return 'Paris';
    if (lower === 'estados unidos' || lower === 'eua' || lower === 'usa') return 'Nova York';
    return clean;
  };

  // Automatically fetch live weather for activeItinerary destination
  useEffect(() => {
    if (!activeItinerary?.destination) return;

    let isMounted = true;
    setIsLoadingWeather(true);

    const fetchLiveWeather = async () => {
      const destinationStr = activeItinerary.destination;
      const cleanCity = resolveCityQuery(destinationStr);

      try {
        // Geocoding
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}&count=1&language=pt`
        );
        let lat = 48.8566;
        let lon = 2.3522;
        let foundTz = 'Europe/Paris';

        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
            if (geoData.results[0].timezone) {
              foundTz = geoData.results[0].timezone;
            }
          }
        }

        // Forecast with timezone=auto
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
        );

        if (weatherRes.ok) {
          const wData = await weatherRes.json();
          const current = wData.current;
          const daily = wData.daily;
          const info = getWeatherInfo(current.weather_code);

          if (isMounted) {
            const tz = wData.timezone || foundTz;
            setDestinationTimezone(tz);
            setTimezoneAbbr(wData.timezone_abbreviation || tz.split('/')[1]?.replace('_', ' ') || 'Local');
            setWeather({
              temp: Math.round(current.temperature_2m),
              desc: info.desc,
              max: Math.round(daily.temperature_2m_max[0]),
              min: Math.round(daily.temperature_2m_min[0]),
              humidity: current.relative_humidity_2m,
              wind: Math.round(current.wind_speed_10m),
              icon: info.icon
            });
          }
        }
      } catch (err) {
        console.warn('Usando previsão climática estimada:', err);
      } finally {
        if (isMounted) setIsLoadingWeather(false);
      }
    };

    fetchLiveWeather();

    return () => { isMounted = false; };
  }, [activeItinerary?.destination]);

  // Update local state if active itinerary changes
  useEffect(() => {
    setActivities(activeItinerary?.activities || []);
  }, [activeItinerary]);

  if (!activeItinerary) {
    return <div className="p-8 text-center text-slate-500 font-medium">Nenhum roteiro disponível.</div>;
  }

  const toggleChecklist = (id: string) => {
    setActivities(acts => acts.map(act => 
      act.id === id ? { ...act, isCompleted: !act.isCompleted } : act
    ));
  };

  const getDestinationTime = () => {
    try {
      return now.toLocaleTimeString('pt-BR', {
        timeZone: destinationTimezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getDestinationDate = () => {
    try {
      return now.toLocaleDateString('pt-BR', {
        timeZone: destinationTimezone,
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return '';
    }
  };

  const openGPS = (url: string) => {
    window.open(url, '_blank');
  };

  // Group by date
  const groupedActivities = activities.reduce((acc, curr) => {
    const dateKey = curr.date || 'Data não definida';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(curr);
    return acc;
  }, {} as Record<string, Activity[]>);

  const WeatherIcon = weather.icon;

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 relative flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="w-full max-w-4xl mx-auto flex flex-col min-h-full pb-8">
        
        {/* Multi-trip selector banner if client has more than 1 itinerary */}
        {userItineraries.length > 1 && (
          <div className="mb-4 px-3 md:px-0">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
              <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">
                <Plane className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Minhas Viagens:</span>
              </div>
              <div className="flex items-center gap-2">
                {userItineraries.map((it) => {
                  const isSelected = it.id === activeItinerary.id;
                  return (
                    <button
                      key={it.id}
                      onClick={() => setSelectedItineraryId(it.id)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border",
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{it.destination || it.title}</span>
                      {isSelected && <span className="text-[10px] bg-blue-500/80 px-1.5 py-0.2 rounded-sm font-semibold">Ativo</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Header / Automatic Live Weather Banner (Bespoke Clean Design) */}
        <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 p-5 md:p-6 md:rounded-xl text-white shrink-0 shadow-xs mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <MapPin className="w-4 h-4 text-blue-400" />
                {activeItinerary.destination || 'Paris, França'}
              </div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Previsão do Tempo • Destino</span>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold flex items-center justify-end text-blue-300">
                <Clock className="w-3.5 h-3.5 mr-1 text-blue-400 shrink-0" />
                {getDestinationTime()}
              </span>
              <div className="text-[10px] text-slate-400 font-medium">
                Horário Local no Destino ({timezoneAbbr}) • {getDestinationDate()}
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-slate-800/80 px-2.5 py-0.5 rounded-md mt-1 border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Dados em Tempo Real
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-800/80 border border-slate-700 rounded-lg">
                <WeatherIcon className="w-8 h-8 text-amber-400 shrink-0" />
              </div>
              <div>
                <div className="text-2xl md:text-4xl font-extrabold tracking-tight">
                  {weather.temp}°C
                </div>
                <p className="text-xs font-medium text-slate-300 mt-0.5">{weather.desc}</p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-300 space-y-1">
              <div>
                Max: <span className="font-bold text-white">{weather.max}°</span> Min: <span className="font-bold text-white">{weather.min}°</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Umidade: {weather.humidity}% • Vento: {weather.wind} km/h
              </div>
            </div>
          </div>
        </div>

        {/* Timeline List */}
        <div className="flex-1 px-4 md:px-8 overflow-y-auto space-y-6">
          {Object.entries(groupedActivities).map(([date, acts]: [string, Activity[]]) => (
            <div key={date}>
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                {date !== 'Data não definida' ? format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR }) : date}
              </div>
              
              <div className="space-y-3">
                {acts.map((act) => (
                  <div 
                    key={act.id} 
                    className={cn(
                      "bg-white dark:bg-slate-900 p-4 rounded-xl border transition-all shadow-xs",
                      act.isCompleted ? "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-60" : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {act.time || 'Horário livre'}
                      </span>
                      <button 
                        onClick={() => toggleChecklist(act.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title={act.isCompleted ? "Marcar como pendente" : "Marcar como concluído"}
                      >
                        {act.isCompleted ? (
                          <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">✓</div>
                        ) : (
                          <div className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400"></div>
                        )}
                      </button>
                    </div>
                    
                    <div className={cn("text-xs font-bold text-slate-900 dark:text-slate-100 mt-2", act.isCompleted && "line-through text-slate-400 dark:text-slate-500 decoration-slate-300 dark:decoration-slate-600")}>
                      {act.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {act.location} {act.location && act.description ? '•' : ''} {act.description}
                    </div>
                    
                    {!act.isCompleted && act.mapLink && (
                      <button
                        onClick={() => openGPS(act.mapLink)}
                        className="mt-3 w-full py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs active:translate-y-0.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Abrir no GPS</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
