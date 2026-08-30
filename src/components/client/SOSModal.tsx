import React from 'react';
import { ShieldAlert, PhoneCall, X, AlertTriangle, Building2, MapPin, Check, Copy } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SOSModal({ isOpen, onClose }: SOSModalProps) {
  const { itineraries, currentUserEmail, systemLicense } = useApp();
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const userItineraries = itineraries.filter(it => it.clientEmail === currentUserEmail);
  const activeItinerary = userItineraries.length > 0 ? userItineraries[0] : itineraries[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const agencyPhone = systemLicense?.contactDevWhatsapp || '+55 (11) 99999-8888';
  const insurancePolicy = 'Bradesco Seguros / Apólice #998234-A';
  const embassyContact = 'Embaixada do Brasil: +33 1 45 61 63 00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-red-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Central de Emergência (SOS)</h2>
              <p className="text-xs text-red-100 mt-0.5">Suporte 24h e contatos essenciais no exterior</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          
          {/* Agency Direct Line */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Plantão da Agência</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{agencyPhone}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopy(agencyPhone, 'agency')}
                className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                title="Copiar"
              >
                {copiedText === 'agency' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <a 
                href={`tel:${agencyPhone.replace(/\D/g, '')}`}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                Ligar
              </a>
            </div>
          </div>

          {/* Insurance */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Seguro Viagem</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{insurancePolicy}</span>
              </div>
            </div>

            <button
              onClick={() => handleCopy(insurancePolicy, 'insurance')}
              className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              title="Copiar apólice"
            >
              {copiedText === 'insurance' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Local Consulate / Embassy */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Consulado / Embaixada</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{embassyContact}</span>
              </div>
            </div>

            <button
              onClick={() => handleCopy(embassyContact, 'embassy')}
              className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              title="Copiar contato"
            >
              {copiedText === 'embassy' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Guidance Alert */}
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl p-4 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
              <strong>Em caso de emergência médica ou extravio:</strong> Guarde todos os relatórios (laudos ou PIR da companhia aérea) e acione imediatamente a central do seguro viagem.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
