import React, { useState } from 'react';
import { Phone, MessageCircle, X, AlertTriangle, CheckCircle2, MapPin, Flame, HeartPulse, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface EmergencyContact {
  id: string;
  type: 'police' | 'ambulance' | 'fire' | 'general';
  name: string;
  number: string;
  subtitle: string;
}

export function getEmergencyContacts(destination?: string): EmergencyContact[] {
  if (!destination || destination.trim() === '' || destination === 'Nenhuma' || destination === 'Indefinido') {
    return [
      { id: 'police', type: 'general', name: 'Emergência Geral / Polícia', number: '112', subtitle: 'Central Única (112)' },
      { id: 'ambulance', type: 'ambulance', name: 'Ambulância / Resgate', number: '112', subtitle: 'Socorro Médico (112)' },
      { id: 'fire', type: 'fire', name: 'Corpo de Bombeiros', number: '112', subtitle: 'Incêndios e Resgate (112)' }
    ];
  }

  const normalized = destination.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('brasil') || normalized.includes('sao paulo') || normalized.includes('rio de janeiro') || normalized.includes('brasilia') || normalized.includes('salvador') || normalized.includes('curitiba') || normalized.includes('florianopolis') || normalized.includes('belo horizonte')) {
    return [
      { id: 'police', type: 'police', name: 'Polícia Militar', number: '190', subtitle: 'Ligar 190 (Emergências Policiais)' },
      { id: 'ambulance', type: 'ambulance', name: 'Ambulância (SAMU)', number: '192', subtitle: 'Ligar 192 (Socorro Médico Urgente)' },
      { id: 'fire', type: 'fire', name: 'Corpo de Bombeiros', number: '193', subtitle: 'Ligar 193 (Resgate e Incêndios)' }
    ];
  }

  if (normalized.includes('eua') || normalized.includes('usa') || normalized.includes('estados unidos') || normalized.includes('orlando') || normalized.includes('miami') || normalized.includes('nova york') || normalized.includes('new york') || normalized.includes('los angeles') || normalized.includes('las vegas') || normalized.includes('florida') || normalized.includes('canada') || normalized.includes('toronto')) {
    return [
      { id: 'police', type: 'police', name: 'Polícia (EUA/Canadá)', number: '911', subtitle: 'Ligar 911 (Emergência 24h)' },
      { id: 'ambulance', type: 'ambulance', name: 'Ambulância / Emergência Médica', number: '911', subtitle: 'Ligar 911 (Atendimento Médico)' },
      { id: 'fire', type: 'fire', name: 'Corpo de Bombeiros', number: '911', subtitle: 'Ligar 911 (Resgate e Incêndio)' }
    ];
  }

  if (normalized.includes('reino unido') || normalized.includes('inglaterra') || normalized.includes('uk') || normalized.includes('londres') || normalized.includes('london') || normalized.includes('escocia')) {
    return [
      { id: 'police', type: 'police', name: 'Polícia (Reino Unido)', number: '999', subtitle: 'Ligar 999 (ou 112)' },
      { id: 'ambulance', type: 'ambulance', name: 'Ambulância (NHS Emergency)', number: '999', subtitle: 'Ligar 999 (ou 111 para não urgentes)' },
      { id: 'fire', type: 'fire', name: 'Corpo de Bombeiros', number: '999', subtitle: 'Ligar 999 (Resgate)' }
    ];
  }

  if (normalized.includes('japao') || normalized.includes('japan') || normalized.includes('toquio') || normalized.includes('tokyo') || normalized.includes('kyoto') || normalized.includes('osaka')) {
    return [
      { id: 'police', type: 'police', name: 'Polícia (Japão)', number: '110', subtitle: 'Ligar 110 (Emergência Policial)' },
      { id: 'ambulance', type: 'ambulance', name: 'Ambulância (Resgate Médico)', number: '119', subtitle: 'Ligar 119 (Socorro Médico)' },
      { id: 'fire', type: 'fire', name: 'Corpo de Bombeiros', number: '119', subtitle: 'Ligar 119 (Incêndios)' }
    ];
  }

  if (normalized.includes('australia') || normalized.includes('sydney') || normalized.includes('melbourne')) {
    return [
      { id: 'police', type: 'police', name: 'Polícia (Austrália)', number: '000', subtitle: 'Ligar 000 (Emergência Central)' },
      { id: 'ambulance', type: 'ambulance', name: 'Ambulância', number: '000', subtitle: 'Ligar 000 (Emergência Médica)' },
      { id: 'fire', type: 'fire', name: 'Corpo de Bombeiros', number: '000', subtitle: 'Ligar 000 (Resgate)' }
    ];
  }

  if (normalized.includes('argentina') || normalized.includes('buenos aires') || normalized.includes('bariloche')) {
    return [
      { id: 'police', type: 'police', name: 'Polícia (Argentina)', number: '911', subtitle: 'Ligar 911 (Emergência Policial)' },
      { id: 'ambulance', type: 'ambulance', name: 'Ambulância (SAME)', number: '107', subtitle: 'Ligar 107 (Atendimento Médico)' },
      { id: 'fire', type: 'fire', name: 'Bombeiros', number: '100', subtitle: 'Ligar 100 (Incêndios e Resgate)' }
    ];
  }

  if (normalized.includes('chile') || normalized.includes('santiago')) {
    return [
      { id: 'police', type: 'police', name: 'Carabineros / Polícia', number: '133', subtitle: 'Ligar 133' },
      { id: 'ambulance', type: 'ambulance', name: 'Ambulância (SAMU)', number: '131', subtitle: 'Ligar 131' },
      { id: 'fire', type: 'fire', name: 'Bombeiros', number: '132', subtitle: 'Ligar 132' }
    ];
  }

  if (normalized.includes('franca') || normalized.includes('paris')) {
    return [
      { id: 'police', type: 'police', name: 'Polícia (Police Secours)', number: '17', subtitle: 'Ligar 17 (ou 112)' },
      { id: 'ambulance', type: 'ambulance', name: 'Ambulância (SAMU)', number: '15', subtitle: 'Ligar 15 (ou 112)' },
      { id: 'fire', type: 'fire', name: 'Bombeiros (Sapeurs-Pompiers)', number: '18', subtitle: 'Ligar 18 (ou 112)' }
    ];
  }

  // Generic Europe / Default
  return [
    { id: 'police', type: 'police', name: `Polícia Local (${destination})`, number: '112', subtitle: 'Ligar 112 (Emergência Europeia/Geral)' },
    { id: 'ambulance', type: 'ambulance', name: 'Ambulância / Socorro Médico', number: '112', subtitle: 'Ligar 112 (Atendimento Médico)' },
    { id: 'fire', type: 'fire', name: 'Corpo de Bombeiros', number: '112', subtitle: 'Ligar 112 (Incêndios e Resgate)' }
  ];
}

export default function SOSModal({ isOpen, onClose }: SOSModalProps) {
  const { currentUserEmail, addClientAlert, clients, itineraries } = useApp();
  const [showToast, setShowToast] = useState(false);

  if (!isOpen) return null;

  const client = clients.find(c => c.email?.toLowerCase() === currentUserEmail?.toLowerCase());
  const clientItinerary = itineraries.find(it => 
    it.clientEmail?.toLowerCase() === currentUserEmail?.toLowerCase() ||
    it.clientId === client?.id
  );

  const currentDestination = clientItinerary?.destination || client?.nextTrip || client?.lastTrip || '';
  const emergencyContacts = getEmergencyContacts(currentDestination);

  const handleSOSAlert = () => {
    if (currentUserEmail) {
      addClientAlert({
        id: `sos_${Date.now()}`,
        clientEmail: currentUserEmail,
        clientName: client?.name || currentUserEmail,
        destination: currentDestination || 'Não especificado',
        type: 'SOS',
        message: `ALERTA S.O.S: O cliente ${client?.name || currentUserEmail} acionou o botão de emergência (${currentDestination || 'em viagem'}).`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'police':
        return <ShieldAlert className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'ambulance':
        return <HeartPulse className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />;
      case 'fire':
        return <Flame className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      default:
        return <Phone className="h-5 w-5 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center px-4 pb-4 pt-4 sm:p-0">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-5 z-[110]">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div className="text-left">
            <p className="font-bold text-sm">Alerta Enviado ao Administrador!</p>
            <p className="text-xs text-slate-300">A equipe da agência foi notificada em tempo real.</p>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 text-left shadow-2xl transition-all sm:my-8 z-10 animate-in slide-in-from-bottom-8 duration-300 border border-slate-200 dark:border-slate-800">
        <div className="bg-red-50 dark:bg-red-950/50 px-6 py-5 border-b border-red-100 dark:border-red-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900/60 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Canais de Emergência</h3>
              {currentDestination && (
                <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 font-semibold mt-0.5">
                  <MapPin className="w-3 h-3 text-red-500" /> {currentDestination}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-5 py-5 space-y-3 max-h-[75vh] overflow-y-auto">
          {/* Main agency panic button */}
          <button
            onClick={handleSOSAlert}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-md active:scale-95 shadow-red-600/20 font-bold text-sm"
          >
            <AlertTriangle className="h-5 w-5" />
            Enviar Alerta para o Administrador
          </button>

          {/* WhatsApp Agência */}
          <a
            href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20de%20emerg%C3%AAncia%20para%20minha%20viagem."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors shadow-sm active:scale-95"
          >
            <div className="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 p-2.5 rounded-xl shrink-0">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">WhatsApp Agência</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Suporte prioritário 24h</p>
            </div>
          </a>

          <div className="pt-1">
            <p className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 px-1 mb-2">
              Serviços Locais de Emergência ({currentDestination || 'Local'})
            </p>

            <div className="space-y-2">
              {emergencyContacts.map((contact) => (
                <a
                  key={contact.id}
                  href={`tel:${contact.number}`}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 group"
                >
                  <div className="bg-white dark:bg-slate-700 p-2.5 rounded-xl shrink-0 border border-slate-200 dark:border-slate-600 shadow-xs">
                    {getContactIcon(contact.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">{contact.name}</p>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 shrink-0">
                        {contact.number}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{contact.subtitle}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

