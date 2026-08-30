import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, CheckCircle2, Circle, Navigation, CloudRain, Clock, Calendar as CalendarIcon, Sun, Cloud, CloudSnow, CloudLightning, Wind, Droplets, Plane, Compass } from 'lucide-react';
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
  const effectiveEmail = (currentUserEmail || localStorage.getItem('userEmail') || '').trim().toLowerCase();
  const currentClient = clients.find(c => 
    (c.email || '').trim().toLowerCase() === effectiveEmail
  );

  // STRICT ISOLATION: Find ONLY the itinerary specifically assigned to this logged-in passenger
  const activeItinerary = useMemo(() => {
    if (!effectiveEmail && !currentClient) {
      return itineraries[0];
    }

    const cleanUserName = (currentClient?.name || '').trim().toLowerCase();
    const clientId = currentClient?.id || '';

    // Match strictly by client email, client name or client ID
    const userMatches = itineraries.filter(it => {
      const matchEmail = it.clientEmail && it.clientEmail.trim().toLowerCase() === effectiveEmail;
      const matchName = cleanUserName && it.clientName && it.clientName.trim().toLowerCase() === cleanUserName;
      const matchId = clientId && it.clientId && it.clientId === clientId;
      return matchEmail || matchName || matchId;
    });

    if (userMatches.length > 0) {
      const sorted = [...userMatches].sort((a, b) => {
        const isANext = currentClient?.nextTrip && a.destination?.toLowerCase().includes(currentClient.nextTrip.toLowerCase());
        const isBNext = currentClient?.nextTrip && b.destination?.toLowerCase().includes(currentClient.nextTrip.toLowerCase());
        if (isANext && !isBNext) return -1;
        if (!isANext && isBNext) return 1;
        return (b.id || '').localeCompare(a.id || '') || (b.startDate || '').localeCompare(a.startDate || '');
      });
      return sorted[0];
    }

    if (currentClient?.nextTrip && currentClient.nextTrip !== 'Nenhuma' && currentClient.nextTrip !== 'Não definida') {
      const destMatch = itineraries.find(it => 
        it.destination?.toLowerCase().includes(currentClient.nextTrip.toLowerCase())
      );
      if (destMatch) return destMatch;
    }

    return itineraries[0];
  }, [itineraries, effectiveEmail, currentClient]);
  
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

  const groupedActivities = activities.reduce((acc, curr) => {
    const dateKey = curr.date || 'Data não definida';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(curr);
    return acc;
  }, {} as Record<string, Activity[]>);

  const WeatherIcon = weather.icon;

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 relative flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="w-full max-w-4xl mx-auto flex flex-col min-h-full pb-12 px-4 sm:px-6">
        
        {/* Dynamic Hero Header */}
        <header className="pt-6 sm:pt-8 pb-6 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-white/20">
              <Compass className="w-3.5 h-3.5" />
              <span>Roteiro Concierge</span>
            </div>

            <div className="space-y-2 relative z-10 max-w-xl">
              <div className="flex items-center gap-2 text-blue-100 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>{activeItinerary.destination || 'Santiago, Chile'}</span>
              </div>
              
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {activeItinerary.title || activeItinerary.destination}
              </h1>
              
              <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed">
                Acompanhe o seu itinerário dia a dia com mapa GPS integrado e clima em tempo real.
              </p>
            </div>

            {/* Weather & Time Capsule */}
            <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between border border-white/15">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Hora Local</span>
                    <span className="text-lg font-extrabold tracking-tight text-white">{getDestinationTime()}</span>
                  </div>
                </div>
                <span className="text-xs text-blue-100 font-medium capitalize">{getDestinationDate()}</span>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between border border-white/15">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <WeatherIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block capitalize">{weather.desc}</span>
                    <span className="text-lg font-extrabold tracking-tight text-white">{weather.temp}°C</span>
                  </div>
                </div>
                <div className="text-right text-xs text-blue-100">
                  <span className="font-semibold">{weather.min}° / {weather.max}°</span>
                  <span className="block text-[11px] opacity-80">Hum: {weather.humidity}%</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Chronological Activities Timeline */}
        <div className="flex-1 space-y-8">
          {Object.entries(groupedActivities).map(([date, acts]: [string, Activity[]]) => (
            <section key={date} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {date !== 'Data não definida' ? format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR }) : date}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {acts.length} {acts.length === 1 ? 'atividade' : 'atividades'}
                </span>
              </div>
              
              <div className="space-y-3">
                {acts.map((act) => (
                  <article 
                    key={act.id} 
                    className={cn(
                      "bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all duration-200 shadow-xs relative overflow-hidden",
                      act.isCompleted 
                        ? "border-slate-200/60 dark:border-slate-800/40 bg-slate-50/60 dark:bg-slate-950/40 opacity-60" 
                        : "border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg">
                            {act.time || 'Horário Livre'}
                          </span>
                          {act.location && (
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-xs flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {act.location}
                            </span>
                          )}
                        </div>

                        <h3 className={cn(
                          "text-base font-bold text-slate-900 dark:text-slate-100 leading-snug", 
                          act.isCompleted && "line-through text-slate-400 dark:text-slate-500"
                        )}>
                          {act.title}
                        </h3>

                        {act.description && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
                            {act.description}
                          </p>
                        )}
                      </div>

                      {/* Completed Toggle Button */}
                      <button 
                        onClick={() => toggleChecklist(act.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-transform active:scale-90 shrink-0"
                        title={act.isCompleted ? "Marcar como pendente" : "Marcar como concluído"}
                      >
                        {act.isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 hover:text-blue-500" />
                        )}
                      </button>
                    </div>
                    
                    {!act.isCompleted && act.mapLink && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => openGPS(act.mapLink)}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Abrir no GPS / Google Maps</span>
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
