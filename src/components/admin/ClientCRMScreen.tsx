import React, { useState, useRef, useMemo } from 'react';
import { Search, Filter, User, Heart, Coffee, Plane, Utensils, Hotel, ChevronDown, CheckCircle2, Plus, X, Upload, FileText, RotateCcw, Tag, Sparkles, Clock, Compass } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export default function ClientCRMScreen() {
  const { clients, addClient, updateClient, addClientDocument, clientDocuments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Advanced Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [tripFilter, setTripFilter] = useState<'ALL' | 'HAS_TRIP' | 'NO_TRIP' | 'Em Planejamento' | 'Em Andamento' | 'Finalizada'>('ALL');
  const [seatFilter, setSeatFilter] = useState<string>('ALL');
  const [dietFilter, setDietFilter] = useState<string>('ALL');
  const [hotelFilter, setHotelFilter] = useState<string>('ALL');
  const [selectedInterest, setSelectedInterest] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    nextTrip: '',
    tripStatus: 'Em Planejamento' as 'Em Planejamento' | 'Em Andamento' | 'Finalizada' | 'Nenhuma',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingClientEmail, setUploadingClientEmail] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.email) return;
    
    addClient({
      id: Date.now().toString(),
      name: newClient.name,
      email: newClient.email,
      role: 'CLIENT',
      password: '123456',
      nextTrip: newClient.nextTrip || 'Nenhuma',
      tripStatus: newClient.tripStatus,
      lastTrip: 'Nenhuma',
      preferences: {
        seat: 'Indefinido',
        diet: 'Sem restrições',
        hotel: 'Indefinido',
        interests: [],
      },
      notes: 'Novo cliente cadastrado.'
    });
    
    setIsModalOpen(false);
    setNewClient({ name: '', email: '', nextTrip: '', tripStatus: 'Em Planejamento' });
  };

  const getTripStatusBadge = (status?: string) => {
    switch (status) {
      case 'Em Planejamento':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5" /> Em Planejamento
          </span>
        );
      case 'Em Andamento':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 shrink-0">
            <Plane className="w-3.5 h-3.5 animate-pulse" /> Em Andamento
          </span>
        );
      case 'Finalizada':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Viagem Finalizada
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shrink-0">
            <Compass className="w-3.5 h-3.5" /> Sem Viagem
          </span>
        );
    }
  };

  // Collect all available interests dynamically
  const allInterests = useMemo(() => {
    return Array.from(
      new Set(
        clients.flatMap(c => c.preferences?.interests || ['Gastronomia', 'Cultura', 'Aventura', 'Praia', 'Compras', 'Luxo'])
      )
    );
  }, [clients]);

  const clearFilters = () => {
    setTripFilter('ALL');
    setSeatFilter('ALL');
    setDietFilter('ALL');
    setHotelFilter('ALL');
    setSelectedInterest('');
  };

  const activeFilterCount = useMemo(() => {
    return (tripFilter !== 'ALL' ? 1 : 0) +
      (seatFilter !== 'ALL' ? 1 : 0) +
      (dietFilter !== 'ALL' ? 1 : 0) +
      (hotelFilter !== 'ALL' ? 1 : 0) +
      (selectedInterest ? 1 : 0);
  }, [tripFilter, seatFilter, dietFilter, hotelFilter, selectedInterest]);

  const filteredClients = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    return clients.filter(c => {
      const isClientRole = (c.role === 'CLIENT' || c.role === undefined);
      if (!isClientRole) return false;

      if (searchLower) {
        const matchesSearch = (c.name || '').toLowerCase().includes(searchLower) || 
          (c.email || '').toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (tripFilter === 'HAS_TRIP' && (!c.nextTrip || c.nextTrip === 'Nenhuma')) return false;
      if (tripFilter === 'NO_TRIP' && c.nextTrip && c.nextTrip !== 'Nenhuma') return false;
      if (tripFilter === 'Em Planejamento' && c.tripStatus !== 'Em Planejamento') return false;
      if (tripFilter === 'Em Andamento' && c.tripStatus !== 'Em Andamento') return false;
      if (tripFilter === 'Finalizada' && c.tripStatus !== 'Finalizada') return false;

      if (seatFilter !== 'ALL' && c.preferences?.seat !== seatFilter) return false;
      if (dietFilter !== 'ALL' && c.preferences?.diet !== dietFilter) return false;
      if (hotelFilter !== 'ALL' && c.preferences?.hotel !== hotelFilter) return false;

      if (selectedInterest && !c.preferences?.interests?.includes(selectedInterest)) return false;

      return true;
    });
  }, [clients, searchTerm, tripFilter, seatFilter, dietFilter, hotelFilter, selectedInterest]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingClientEmail) {
      // Security: Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de arquivo não permitido. Envie apenas PDF, JPG, PNG ou WEBP.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      const MAX_SIZE_MB = 5;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`O arquivo é muito grande. O tamanho máximo permitido é ${MAX_SIZE_MB}MB.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        addClientDocument({
          id: `doc_${Date.now()}`,
          clientEmail: uploadingClientEmail,
          title: file.name,
          type: file.type.includes('pdf') ? 'PDF' : 'IMAGEM',
          isOfflineAvailable: true,
          fileUrl: dataUrl
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setUploadingClientEmail(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-bold">Documento adicionado ao cofre do cliente!</span>
        </div>
      )}

      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload}
        accept=".pdf,image/*"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">CRM de Clientes</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base sm:text-lg">Gestão inteligente de preferências e histórico dos viajantes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[1.5rem] transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" /> Novo Cliente
        </button>
      </div>

      {/* Top Bar / Search */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 dark:border-slate-800 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-[1.5rem] font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              placeholder="Buscar por nome ou e-mail..."
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "w-full md:w-auto px-8 py-4 font-bold rounded-[1.5rem] transition-all flex items-center justify-center gap-2 active:scale-[0.98] border cursor-pointer",
              showFilters || activeFilterCount > 0
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                : "bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border-slate-800 dark:border-slate-700 shadow-lg shadow-slate-900/20"
            )}
          >
            <Filter className="w-5 h-5" /> 
            Filtros Avançados
            {activeFilterCount > 0 && (
              <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full font-black ml-1">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Advanced Filters Drawer */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" /> Filtrar por Preferências e Status
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Limpar Filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Trip Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Status da Viagem</label>
                <select
                  value={tripFilter}
                  onChange={(e) => setTripFilter(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-bold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Todas as situações</option>
                  <option value="Em Planejamento">Em Planejamento</option>
                  <option value="Em Andamento">Em Andamento (Em viagem)</option>
                  <option value="Finalizada">Finalizadas</option>
                  <option value="HAS_TRIP">Com viagem agendada</option>
                  <option value="NO_TRIP">Sem viagem agendada</option>
                </select>
              </div>

              {/* Seat Preference Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Assento Favorito</label>
                <select
                  value={seatFilter}
                  onChange={(e) => setSeatFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-bold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Todos os assentos</option>
                  <option value="Janela">Janela</option>
                  <option value="Corredor">Corredor</option>
                  <option value="Indefinido">Indefinido</option>
                </select>
              </div>

              {/* Diet Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Restrição Alimentar</label>
                <select
                  value={dietFilter}
                  onChange={(e) => setDietFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-bold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Todas as restrições</option>
                  <option value="Sem restrições">Sem restrições</option>
                  <option value="Vegetariano">Vegetariano</option>
                  <option value="Vegano">Vegano</option>
                  <option value="Sem glúten">Sem glúten</option>
                </select>
              </div>

              {/* Hotel Preference Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Estilo de Hospedagem</label>
                <select
                  value={hotelFilter}
                  onChange={(e) => setHotelFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-bold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Todos os estilos</option>
                  <option value="5 estrelas">5 Estrelas</option>
                  <option value="Boutique">Hotel Boutique</option>
                  <option value="Resort">Resort</option>
                  <option value="Indefinido">Indefinido</option>
                </select>
              </div>
            </div>

            {/* Interests Tag Cloud */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Filtrar por Interesses
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedInterest('')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                    !selectedInterest
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  Todos
                </button>
                {allInterests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => setSelectedInterest(selectedInterest === interest ? '' : interest)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                      selectedInterest === interest
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Client List */}
      <div className="space-y-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
            {/* Main Row */}
            <div 
              className="p-8 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-inner ring-4 ring-slate-100 dark:ring-slate-800 shrink-0">
                  <img src={`https://ui-avatars.com/api/?name=${client.name}&background=f8fafc&color=0f172a&bold=true`} alt={client.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{client.name}</h2>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    {client.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 md:ml-auto">
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Próxima Viagem</p>
                  <p className="text-slate-900 dark:text-slate-100 font-bold text-sm mb-1">{client.nextTrip || 'Nenhuma'}</p>
                  {getTripStatusBadge(client.tripStatus)}
                </div>
                <div className={cn("w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-transform duration-300 text-slate-700 dark:text-slate-300", expandedId === client.id && "rotate-180 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400")}>
                  <ChevronDown className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <div className={cn(
              "overflow-hidden transition-all duration-500 ease-in-out border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40",
              expandedId === client.id ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                
                {/* Preferences */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gostos Pessoais</h4>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 dark:bg-blue-950/60 p-2 rounded-xl text-blue-500"><Plane className="w-4 h-4" /></div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{client.preferences?.seat || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-xl text-emerald-500"><Utensils className="w-4 h-4" /></div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{client.preferences?.diet || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-50 dark:bg-purple-950/60 p-2 rounded-xl text-purple-500"><Hotel className="w-4 h-4" /></div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{client.preferences?.hotel || 'N/A'}</span>
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-4 lg:col-span-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Interesses</h4>
                  <div className="flex flex-wrap gap-2">
                    {client.preferences?.interests?.map(interest => (
                      <span key={interest} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-4 lg:col-span-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Observações da Agência</h4>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    "{client.notes}"
                  </div>
                </div>

              </div>
              
              <div className="bg-slate-900 dark:bg-slate-950 px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white border-t border-slate-800">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status da Viagem:</span>
                  <select
                    value={client.tripStatus || 'Em Planejamento'}
                    onChange={(e) => updateClient(client.id, { ...client, tripStatus: e.target.value as any })}
                    className="bg-slate-800 text-white text-xs font-bold rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Em Planejamento">Em Planejamento</option>
                    <option value="Em Andamento">Em Andamento (Em Viagem)</option>
                    <option value="Finalizada">Viagem Finalizada</option>
                    <option value="Nenhuma">Sem Viagem Agendada</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setUploadingClientEmail(client.email);
                      fileInputRef.current?.click();
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-bold transition-colors flex items-center gap-2 text-white"
                  >
                    <Upload className="w-4 h-4" />
                    Enviar p/ Cofre
                  </button>
                  <button onClick={() => setEditingClient(client)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold transition-colors text-white">
                    Editar Perfil
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="text-center py-20 text-slate-400 font-medium text-lg">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
      {/* Create Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Novo Cliente</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateClient} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Nome Completo</label>
                <input 
                  required 
                  type="text"
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">E-mail</label>
                <input 
                  required 
                  type="email"
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  placeholder="Ex: joao@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Destino da Viagem / País</label>
                <input 
                  type="text"
                  value={newClient.nextTrip}
                  onChange={e => setNewClient({ ...newClient, nextTrip: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  placeholder="Ex: Roma, Itália ou Orlando, EUA"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Status da Viagem</label>
                <select
                  value={newClient.tripStatus}
                  onChange={e => setNewClient({ ...newClient, tripStatus: e.target.value as any })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all cursor-pointer"
                >
                  <option value="Em Planejamento">Em Planejamento</option>
                  <option value="Em Andamento">Em Andamento (Em Viagem)</option>
                  <option value="Finalizada">Viagem Finalizada</option>
                  <option value="Nenhuma">Sem Viagem Agendada</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                Cadastrar Cliente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Editar Perfil</h2>
              <button 
                onClick={() => setEditingClient(null)}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              updateClient(editingClient.id, { ...editingClient });
              setEditingClient(null);
            }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Nome Completo</label>
                <input 
                  required 
                  type="text"
                  value={editingClient.name || ''}
                  onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">E-mail</label>
                <input 
                  required 
                  type="email"
                  value={editingClient.email || ''}
                  onChange={e => setEditingClient({ ...editingClient, email: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Senha de Acesso</label>
                <input 
                  type="text"
                  value={editingClient.password || ''}
                  onChange={e => setEditingClient({ ...editingClient, password: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  placeholder="Deixe em branco se não quiser definir"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Destino da Viagem (País/Cidade)</label>
                <input 
                  type="text"
                  value={editingClient.nextTrip || ''}
                  onChange={e => setEditingClient({ ...editingClient, nextTrip: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  placeholder="Ex: Roma, Itália ou Orlando, EUA"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Status da Viagem</label>
                <select
                  value={editingClient.tripStatus || 'Em Planejamento'}
                  onChange={e => setEditingClient({ ...editingClient, tripStatus: e.target.value as any })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all cursor-pointer"
                >
                  <option value="Em Planejamento">Em Planejamento</option>
                  <option value="Em Andamento">Em Andamento (Em Viagem)</option>
                  <option value="Finalizada">Viagem Finalizada</option>
                  <option value="Nenhuma">Sem Viagem Agendada</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Preferências</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Assento</label>
                    <input 
                      type="text"
                      value={editingClient.preferences?.seat || ''}
                      onChange={e => setEditingClient({ ...editingClient, preferences: { ...editingClient.preferences, seat: e.target.value } })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Dieta</label>
                    <input 
                      type="text"
                      value={editingClient.preferences?.diet || ''}
                      onChange={e => setEditingClient({ ...editingClient, preferences: { ...editingClient.preferences, diet: e.target.value } })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Hotel</label>
                    <input 
                      type="text"
                      value={editingClient.preferences?.hotel || ''}
                      onChange={e => setEditingClient({ ...editingClient, preferences: { ...editingClient.preferences, hotel: e.target.value } })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Interesses (separados por vírgula)</label>
                    <input 
                      type="text"
                      value={editingClient.preferences?.interests?.join(', ') || ''}
                      onChange={e => setEditingClient({ ...editingClient, preferences: { ...editingClient.preferences, interests: e.target.value.split(',').map((i: string) => i.trim()) } })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Notas</h3>
                <textarea 
                  value={editingClient.notes || ''}
                  onChange={e => setEditingClient({ ...editingClient, notes: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400 min-h-[100px]"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
