import React, { useState, useEffect } from 'react';
import { Languages, Volume2, Search, Copy, Maximize2, MapPin, Sparkles, Check, X, ArrowRight, ShieldAlert, Utensils, Navigation, ShoppingBag, Hotel, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApp } from '../../context/AppContext';

interface Phrase {
  id: string;
  category: 'emergency' | 'restaurant' | 'transport' | 'shopping' | 'hotel' | 'basics';
  pt: string;
  translated: string;
  phonetic: string;
}

interface LanguageData {
  code: string;
  name: string;
  flag: string;
  voiceLang: string;
  phrases: Phrase[];
}

const LANGUAGES_DATABASE: Record<string, LanguageData> = {
  french: {
    code: 'FR',
    name: 'Francês',
    flag: '🇫🇷',
    voiceLang: 'fr-FR',
    phrases: [
      { id: 'f1', category: 'basics', pt: 'Olá / Bom dia', translated: 'Bonjour', phonetic: 'Bonn-joor' },
      { id: 'f2', category: 'basics', pt: 'Por favor', translated: 'S\'il vous plaît', phonetic: 'Sil vu plê' },
      { id: 'f3', category: 'basics', pt: 'Muito obrigado(a)', translated: 'Merci beaucoup', phonetic: 'Mair-sí bo-cú' },
      { id: 'f4', category: 'basics', pt: 'Com licença / Desculpe', translated: 'Pardon / Excusez-moi', phonetic: 'Par-dôn / Ex-kiu-zê muá' },
      { id: 'f5', category: 'basics', pt: 'Você fala inglês/português?', translated: 'Parlez-vous anglais / portugais ?', phonetic: 'Par-lê vú an-glê / por-tiu-gê?' },
      { id: 'f6', category: 'basics', pt: 'Sim / Não', translated: 'Oui / Non', phonetic: 'Uí / Nôn' },

      { id: 'f7', category: 'restaurant', pt: 'A conta, por favor', translated: 'L\'addition, s\'il vous plaît', phonetic: 'La-di-siôn, sil vu plê' },
      { id: 'f8', category: 'restaurant', pt: 'Uma mesa para dois', translated: 'Une table pour deux', phonetic: 'Iun ta-blu pur dơ' },
      { id: 'f9', category: 'restaurant', pt: 'Onde fica o banheiro?', translated: 'Où sont les toilettes ?', phonetic: 'U sôn lê tuá-lêt?' },
      { id: 'f10', category: 'restaurant', pt: 'Água mineral, por favor', translated: 'De l\'eau minérale, s\'il vous plaît', phonetic: 'Dô mi-nê-ral, sil vu plê' },
      { id: 'f11', category: 'restaurant', pt: 'Você aceita cartão de crédito?', translated: 'Acceptez-vous les cartes de crédit ?', phonetic: 'A-cxêp-tê vú lê cart dê crê-dí?' },

      { id: 'f12', category: 'emergency', pt: 'Preciso de ajuda!', translated: 'J\'ai besoin d\'aide !', phonetic: 'Jê bơ-zuân dêt!' },
      { id: 'f13', category: 'emergency', pt: 'Onde fica a farmácia mais próxima?', translated: 'Où est la pharmacie la plus proche ?', phonetic: 'U ê la far-ma-sí la pli próch?' },
      { id: 'f14', category: 'emergency', pt: 'Chame uma ambulância / polícia', translated: 'Appelez une ambulance / la police', phonetic: 'A-plê iun am-biu-lâns / la po-lís' },
      { id: 'f15', category: 'emergency', pt: 'Não estou me sentindo bem', translated: 'Je ne me sens pas bien', phonetic: 'Jơ nơ mơ sân pa biân' },
      { id: 'f16', category: 'emergency', pt: 'Perdi meu passaporte', translated: 'J\'ai perdu mon passeport', phonetic: 'Jê pair-dí môn pass-pôr' },

      { id: 'f17', category: 'transport', pt: 'Quanto custa para ir até...?', translated: 'Combien ça coûte pour aller à... ?', phonetic: 'Côm-biên sa cút pur a-lê a...?' },
      { id: 'f18', category: 'transport', pt: 'Onde fica a estação de metrô?', translated: 'Où est la station de métro ?', phonetic: 'U ê la sta-siôn dê mê-trô?' },
      { id: 'f19', category: 'transport', pt: 'Pode me levar para este endereço?', translated: 'Pouvez-vous m\'emmener à cette adresse ?', phonetic: 'Pu-vê vú man-mê-nê a sêt a-drês?' },

      { id: 'f20', category: 'shopping', pt: 'Quanto custa isto?', translated: 'Combien ça coûte ?', phonetic: 'Côm-biên sa cút?' },
      { id: 'f21', category: 'shopping', pt: 'Posso provar?', translated: 'Puis-je l\'essayer ?', phonetic: 'Puí-jê lê-sê-iê?' },

      { id: 'f22', category: 'hotel', pt: 'Tenho uma reserva em meu nome', translated: 'J\'ai une réservation à mon nom', phonetic: 'Jê iun rê-zair-va-siôn a môn nôm' },
      { id: 'f23', category: 'hotel', pt: 'Qual é a senha do Wi-Fi?', translated: 'Quel est le mot de passe du Wi-Fi ?', phonetic: 'Kêl ê lơ mô dơ pass diu uí-fí?' }
    ]
  },
  italian: {
    code: 'IT',
    name: 'Italiano',
    flag: '🇮🇹',
    voiceLang: 'it-IT',
    phrases: [
      { id: 'i1', category: 'basics', pt: 'Olá / Bom dia', translated: 'Buongiorno / Ciao', phonetic: 'Buôn-jiôr-no / Tchiáo' },
      { id: 'i2', category: 'basics', pt: 'Por favor', translated: 'Per favore / Per piacere', phonetic: 'Pair fa-vô-re' },
      { id: 'i3', category: 'basics', pt: 'Muito obrigado(a)', translated: 'Grazie mille', phonetic: 'Grá-tsi-e mí-le' },
      { id: 'i4', category: 'basics', pt: 'Com licença / Desculpe', translated: 'Scusi / Permesso', phonetic: 'Escú-zi / Pair-mê-so' },
      { id: 'i5', category: 'basics', pt: 'Você fala inglês?', translated: 'Parla inglese?', phonetic: 'Pár-la in-glê-ze?' },

      { id: 'i6', category: 'restaurant', pt: 'A conta, por favor', translated: 'Il conto, per favore', phonetic: 'Il côn-to, pair fa-vô-re' },
      { id: 'i7', category: 'restaurant', pt: 'Uma mesa para dois', translated: 'Un tavolo per due', phonetic: 'Un tá-vo-lo pair dú-e' },
      { id: 'i8', category: 'restaurant', pt: 'Onde fica o banheiro?', translated: 'Dov\'è il bagno?', phonetic: 'Do-vê il bá-gno?' },
      { id: 'i9', category: 'restaurant', pt: 'Uma água sem gás, por favor', translated: 'Un\'acqua naturale, per favore', phonetic: 'Un á-cua na-tu-rá-le, pair fa-vô-re' },

      { id: 'i10', category: 'emergency', pt: 'Preciso de ajuda!', translated: 'Ho bisogno di aiuto!', phonetic: 'Ô bi-zó-gno di a-iú-to!' },
      { id: 'i11', category: 'emergency', pt: 'Onde fica a farmácia?', translated: 'Dov\'è la farmacia?', phonetic: 'Do-vê la far-ma-tchí-a?' },
      { id: 'i12', category: 'emergency', pt: 'Chame a polícia', translated: 'Chiami la polizia', phonetic: 'Kiá-mi la po-li-tsí-a' },

      { id: 'i13', category: 'transport', pt: 'Onde fica a estação?', translated: 'Dov\'è la stazione?', phonetic: 'Do-vê la sta-tsi-ô-ne?' },
      { id: 'i14', category: 'shopping', pt: 'Quanto custa isto?', translated: 'Quanto costa questo?', phonetic: 'Cuán-to côs-ta cuês-to?' },
      { id: 'i15', category: 'hotel', pt: 'Qual é a senha do Wi-Fi?', translated: 'Qual è la password del Wi-Fi?', phonetic: 'Cuál ê la pass-uôrd dên uí-fí?' }
    ]
  },
  spanish: {
    code: 'ES',
    name: 'Espanhol',
    flag: '🇪🇸',
    voiceLang: 'es-ES',
    phrases: [
      { id: 's1', category: 'basics', pt: 'Olá / Bom dia', translated: '¡Hola! / Buenos días', phonetic: 'Ô-la / Buê-nos dí-as' },
      { id: 's2', category: 'basics', pt: 'Por favor', translated: 'Por favor', phonetic: 'Por fa-vôr' },
      { id: 's3', category: 'basics', pt: 'Muito obrigado(a)', translated: 'Muchas gracias', phonetic: 'Mú-tchas grá-si-as' },
      { id: 's4', category: 'basics', pt: 'Com licença / Desculpe', translated: 'Con permiso / Disculpe', phonetic: 'Côn per-mí-so / Dis-cúl-pe' },

      { id: 's5', category: 'restaurant', pt: 'A conta, por favor', translated: 'La cuenta, por favor', phonetic: 'La cuên-ta, por fa-vôr' },
      { id: 's6', category: 'restaurant', pt: 'Onde fica o banheiro?', translated: '¿Dónde está el baño?', phonetic: 'Dôn-de es-tá el bá-ño?' },
      { id: 's7', category: 'restaurant', pt: 'Uma mesa para dois', translated: 'Una mesa para dos', phonetic: 'Ú-na me-sa pa-ra dôs' },

      { id: 's8', category: 'emergency', pt: 'Preciso de ajuda!', translated: '¡Necesito ayuda!', phonetic: 'Ne-ce-sí-to a-jú-da!' },
      { id: 's9', category: 'emergency', pt: 'Onde fica a farmácia?', translated: '¿Dónde está la farmacia?', phonetic: 'Dôn-de es-tá la far-má-si-a?' },

      { id: 's10', category: 'transport', pt: 'Quanto custa para ir até...?', translated: '¿Cuánto cuesta ir a...?', phonetic: 'Cuán-to cuês-ta ir a...?' },
      { id: 's11', category: 'shopping', pt: 'Quanto custa isto?', translated: '¿Cuánto cuesta esto?', phonetic: 'Cuán-to cuês-ta ês-to?' },
      { id: 's12', category: 'hotel', pt: 'Qual é a senha do Wi-Fi?', translated: '¿Cuál es la clave del Wi-Fi?', phonetic: 'Cuál es la clá-ve del uí-fí?' }
    ]
  },
  english: {
    code: 'EN',
    name: 'Inglês',
    flag: '🇺🇸',
    voiceLang: 'en-US',
    phrases: [
      { id: 'e1', category: 'basics', pt: 'Olá / Bom dia', translated: 'Hello / Good morning', phonetic: 'He-ló / Gud mór-nin' },
      { id: 'e2', category: 'basics', pt: 'Por favor', translated: 'Please', phonetic: 'Plíz' },
      { id: 'e3', category: 'basics', pt: 'Muito obrigado(a)', translated: 'Thank you very much', phonetic: 'Tênk iú vé-ri mâtch' },
      { id: 'e4', category: 'basics', pt: 'Com licença / Desculpe', translated: 'Excuse me / Sorry', phonetic: 'Eks-kiúz mí / Só-ri' },

      { id: 'e5', category: 'restaurant', pt: 'A conta, por favor', translated: 'The check, please', phonetic: 'Dê tchêk, plíz' },
      { id: 'e6', category: 'restaurant', pt: 'Onde fica o banheiro?', translated: 'Where is the restroom?', phonetic: 'Uêr iz dê rês-trum?' },

      { id: 'e7', category: 'emergency', pt: 'Preciso de ajuda!', translated: 'I need help!', phonetic: 'Ai níd hélp!' },
      { id: 'e8', category: 'emergency', pt: 'Onde fica a farmácia?', translated: 'Where is the pharmacy?', phonetic: 'Uêr iz dê fár-ma-si?' },

      { id: 'e9', category: 'transport', pt: 'Onde fica a estação de metrô?', translated: 'Where is the subway station?', phonetic: 'Uêr iz dê sáb-uêi stêi-shân?' },
      { id: 'e10', category: 'shopping', pt: 'Quanto custa isto?', translated: 'How much is this?', phonetic: 'Hau mátch iz díz?' },
      { id: 'e11', category: 'hotel', pt: 'Qual é a senha do Wi-Fi?', translated: 'What is the Wi-Fi password?', phonetic: 'Uót iz dê uái-fái pass-uôrd?' }
    ]
  },
  japanese: {
    code: 'JA',
    name: 'Japonês',
    flag: '🇯🇵',
    voiceLang: 'ja-JP',
    phrases: [
      { id: 'j1', category: 'basics', pt: 'Olá / Bom dia', translated: 'Konnichiwa / Ohayou', phonetic: 'Co-ni-tchi-ua / O-ha-iô' },
      { id: 'j2', category: 'basics', pt: 'Por favor', translated: 'Kudasaai / Onegashimasu', phonetic: 'Cú-da-sai / O-ne-gai-shi-mass' },
      { id: 'j3', category: 'basics', pt: 'Muito obrigado(a)', translated: 'Arigatou gozaimasu', phonetic: 'A-ri-ga-tô go-zai-mass' },

      { id: 'j4', category: 'restaurant', pt: 'A conta, por favor', translated: 'O-kaikei o onegaishimasu', phonetic: 'O-kai-kei o o-ne-gai-shi-mass' },
      { id: 'j5', category: 'restaurant', pt: 'Onde fica o banheiro?', translated: 'Toire wa doko desu ka?', phonetic: 'Tô-i-re ua dô-co dess cá?' },

      { id: 'j6', category: 'emergency', pt: 'Preciso de ajuda!', translated: 'Tasukete kudasai!', phonetic: 'Ta-sú-ke-te cú-da-sai!' },
      { id: 'j7', category: 'shopping', pt: 'Quanto custa isto?', translated: 'Kore wa ikura desu ka?', phonetic: 'Cô-re ua i-cú-ra dess cá?' }
    ]
  },
  german: {
    code: 'DE',
    name: 'Alemão',
    flag: '🇩🇪',
    voiceLang: 'de-DE',
    phrases: [
      { id: 'g1', category: 'basics', pt: 'Olá / Bom dia', translated: 'Guten Tag / Hallo', phonetic: 'Gú-ten tág / Ha-lô' },
      { id: 'g2', category: 'basics', pt: 'Por favor', translated: 'Bitte', phonetic: 'Bí-te' },
      { id: 'g3', category: 'basics', pt: 'Muito obrigado(a)', translated: 'Vielen Dank', phonetic: 'Fí-len dánk' },
      { id: 'g4', category: 'restaurant', pt: 'A conta, por favor', translated: 'Die Rechnung, bitte', phonetic: 'Dí réch-nung, bí-te' },
      { id: 'g5', category: 'restaurant', pt: 'Onde fica o banheiro?', translated: 'Wo ist die Toilette?', phonetic: 'Vô ist dí to-a-lé-te?' },
      { id: 'g6', category: 'emergency', pt: 'Preciso de ajuda!', translated: 'Ich brauche Hilfe!', phonetic: 'Ich bráu-che híl-fe!' }
    ]
  }
};

const CATEGORIES = [
  { id: 'all', label: 'Todas', icon: MessageCircle },
  { id: 'emergency', label: 'Emergência', icon: ShieldAlert },
  { id: 'restaurant', label: 'Restaurante', icon: Utensils },
  { id: 'transport', label: 'Transporte', icon: Navigation },
  { id: 'shopping', label: 'Compras', icon: ShoppingBag },
  { id: 'hotel', label: 'Hotel', icon: Hotel },
  { id: 'basics', label: 'Básico', icon: Sparkles },
];

const detectLangFromDestination = (dest?: string): string => {
  if (!dest) return 'french';
  const d = dest.toLowerCase();
  if (d.includes('paris') || d.includes('frança') || d.includes('france')) return 'french';
  if (d.includes('roma') || d.includes('itália') || d.includes('italy') || d.includes('milão') || d.includes('veneza')) return 'italian';
  if (d.includes('orlando') || d.includes('eua') || d.includes('usa') || d.includes('londres') || d.includes('inglaterra') || d.includes('uk') || d.includes('york')) return 'english';
  if (d.includes('buenos aires') || d.includes('argentina') || d.includes('madrid') || d.includes('espanha') || d.includes('cancun') || d.includes('méxico') || d.includes('chile')) return 'spanish';
  if (d.includes('tóquio') || d.includes('toquio') || d.includes('japão') || d.includes('japan')) return 'japanese';
  if (d.includes('berlim') || d.includes('alemanha') || d.includes('munique')) return 'german';
  return 'french';
};

export default function PhrasebookScreen() {
  const { itineraries, currentUserEmail } = useApp();

  const userItinerariesOk = itineraries.filter(it => it.clientEmail === currentUserEmail);
  const activeItinerary = userItinerariesOk.length > 0 ? userItinerariesOk[0] : itineraries[0];

  const autoLangKey = detectLangFromDestination(activeItinerary?.destination);
  const [selectedLangKey, setSelectedLangKey] = useState<string>(autoLangKey);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [fullScreenPhrase, setFullScreenPhrase] = useState<Phrase | null>(null);

  // Custom Quick Translator State
  const [customText, setCustomText] = useState('');
  const [customTranslated, setCustomTranslated] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (autoLangKey) {
      setSelectedLangKey(autoLangKey);
    }
  }, [autoLangKey]);

  const langData = LANGUAGES_DATABASE[selectedLangKey] || LANGUAGES_DATABASE['french'];

  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

  const playAudio = (text: string, id: string) => {
    if (!text.trim()) return;

    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }

    setPlayingId(id);

    const langCode = langData.voiceLang.split('-')[0].toLowerCase();
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${langCode}&client=tw-ob`;

    const audio = new Audio(ttsUrl);
    setActiveAudio(audio);

    audio.play()
      .then(() => {
        audio.onended = () => setPlayingId(null);
        audio.onerror = () => fallbackWebSpeech(text, id);
      })
      .catch((err) => {
        console.warn('Usando fallback do navegador para voz:', err);
        fallbackWebSpeech(text, id);
      });
  };

  const fallbackWebSpeech = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langData.voiceLang;
      utterance.rate = 0.85;

      const voices = window.speechSynthesis.getVoices();
      const targetLangPrefix = langData.voiceLang.split('-')[0].toLowerCase();
      const nativeVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLangPrefix));
      if (nativeVoice) utterance.voice = nativeVoice;

      utterance.onstart = () => setPlayingId(id);
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);

      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingId(null);
    }
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    }
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCustomTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setIsTranslating(true);
    const targetCode = langData.code.toLowerCase();

    const match = langData.phrases.find(p => p.pt.toLowerCase() === customText.toLowerCase().trim() || p.pt.toLowerCase().includes(customText.toLowerCase().trim()));
    if (match) {
      setCustomTranslated(match.translated);
      setIsTranslating(false);
      return;
    }

    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(customText)}&langpair=pt|${targetCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.responseData && data.responseData.translatedText) {
          setCustomTranslated(data.responseData.translatedText);
        } else {
          throw new Error('Sem tradução');
        }
      } else {
        throw new Error('Erro na API');
      }
    } catch (err) {
      console.warn('Fallback de tradução:', err);
      setCustomTranslated(`${customText} (${langData.name})`);
    } finally {
      setIsTranslating(false);
    }
  };

  const filteredPhrases = langData.phrases.filter(phrase => {
    const matchesCategory = selectedCategory === 'all' || phrase.category === selectedCategory;
    const matchesSearch = phrase.pt.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          phrase.translated.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          phrase.phonetic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="w-full max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Guia de Frases & Tradutor
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Pronúncias essenciais e traduções rápidas para a sua viagem.
            </p>
          </div>

          {activeItinerary?.destination && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs self-start sm:self-auto">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{activeItinerary.destination}</span>
            </div>
          )}
        </header>

        {/* Language Selection Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">Idioma:</span>
          {Object.entries(LANGUAGES_DATABASE).map(([key, lang]) => (
            <button
              key={key}
              onClick={() => setSelectedLangKey(key)}
              className={cn(
                "px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border shadow-xs cursor-pointer",
                selectedLangKey === key 
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20" 
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300"
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>

        {/* Quick Instant Translator Input */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Tradutor Instantâneo</h2>
          </div>

          <form onSubmit={handleCustomTranslate} className="flex flex-col sm:flex-row gap-2.5">
            <input 
              type="text"
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder={`Digite qualquer frase em Português...`}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isTranslating}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-blue-500/20 active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isTranslating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Traduzindo...</span>
                </>
              ) : (
                <span>Traduzir ({langData.name})</span>
              )}
            </button>
          </form>

          {customTranslated && (
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Tradução em {langData.name}:</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{customTranslated}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => playAudio(customTranslated, 'custom')}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  title="Ouvir pronúncia"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Ouvir</span>
                </button>

                <button
                  onClick={() => setFullScreenPhrase({
                    id: 'custom',
                    category: 'basics',
                    pt: customText,
                    translated: customTranslated,
                    phonetic: langData.name
                  })}
                  className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  title="Mostrar em Tela Cheia"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Expandir</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Buscar expressão em Português ou ${langData.name}...`}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border shrink-0 cursor-pointer shadow-xs",
                    selectedCategory === cat.id
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  )}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Phrase Cards Grid */}
        <div className="space-y-3">
          {filteredPhrases.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
              <Languages className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Nenhuma frase encontrada para esta busca.</p>
            </div>
          ) : (
            filteredPhrases.map(phrase => (
              <article 
                key={phrase.id} 
                className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {phrase.pt}
                  </span>

                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {phrase.translated}
                  </p>

                  <p className="text-xs text-slate-500 italic">
                    Pronúncia: <span className="text-blue-600 dark:text-blue-400 font-semibold not-italic">{phrase.phonetic}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => playAudio(phrase.translated, phrase.id)}
                    className={cn(
                      "px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer",
                      playingId === phrase.id 
                        ? "bg-indigo-600 text-white" 
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                    )}
                    title="Ouvir áudio da pronúncia"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Ouvir</span>
                  </button>

                  <button
                    onClick={() => handleCopy(phrase.translated, phrase.id)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
                    title="Copiar texto"
                  >
                    {copiedId === phrase.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setFullScreenPhrase(phrase)}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    title="Mostrar em tela cheia para o atendente"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Expandir</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Fullscreen Modal */}
        {fullScreenPhrase && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 p-6 flex flex-col justify-between animate-in fade-in">
            <div className="flex justify-between items-center text-white">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Mostrar para o Atendente / Local
              </span>
              <button 
                onClick={() => setFullScreenPhrase(null)}
                className="p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center space-y-6 my-auto px-4 max-w-2xl mx-auto">
              <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">
                {fullScreenPhrase.pt}
              </p>

              <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight">
                {fullScreenPhrase.translated}
              </h2>

              <p className="text-base text-slate-400">
                Pronúncia: <span className="text-white font-bold">{fullScreenPhrase.phonetic}</span>
              </p>

              <button
                onClick={() => playAudio(fullScreenPhrase.translated, fullScreenPhrase.id)}
                className="mt-6 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl inline-flex items-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-5 h-5" /> Tocar Áudio
              </button>
            </div>

            <p className="text-center text-xs text-slate-500">
              Toque no X no topo para fechar a tela cheia
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
