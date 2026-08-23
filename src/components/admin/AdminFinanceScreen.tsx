import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, CheckCircle2, Plus, X, Search, AlertCircle, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ClientPayment } from '../../types';

export default function AdminFinanceScreen() {
  const { clientPayments, addClientPayment, updateClientPayment, clients } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPayments, setExpandedPayments] = useState<string[]>([]);
  
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(2);
  
  const [newPayment, setNewPayment] = useState<Partial<ClientPayment>>({
    clientId: '',
    description: '',
    amount: 0,
    dueDate: '',
    status: 'PENDING'
  });

  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return 'Sem data';
    try {
      const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.clientId || !newPayment.description || !newPayment.amount || !newPayment.dueDate) return;
    
    const client = clients.find(c => c.id === newPayment.clientId);
    
    let installments = undefined;
    
    if (isInstallment && installmentCount > 1) {
      installments = [];
      const installmentAmount = newPayment.amount / installmentCount;
      let currentDate = new Date(newPayment.dueDate);
      
      for (let i = 1; i <= installmentCount; i++) {
        installments.push({
          id: `inst_${Date.now()}_${i}`,
          number: i,
          amount: installmentAmount,
          dueDate: currentDate.toISOString().split('T')[0],
          status: 'PENDING'
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    addClientPayment({
      id: `pay_${Date.now()}`,
      clientId: newPayment.clientId,
      clientName: client ? client.name : 'Desconhecido',
      description: newPayment.description,
      amount: Number(newPayment.amount),
      dueDate: newPayment.dueDate,
      status: 'PENDING',
      isInstallmentPlan: isInstallment && installmentCount > 1,
      installments
    });
    
    setNewPayment({ clientId: '', description: '', amount: 0, dueDate: '', status: 'PENDING' });
    setIsInstallment(false);
    setInstallmentCount(2);
    setIsModalOpen(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedPayments(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const handleInstallmentPaid = (paymentId: string, installmentId: string) => {
    const payment = clientPayments.find(p => p.id === paymentId);
    if (!payment || !payment.installments) return;
    
    const updatedInstallments = payment.installments.map(inst => 
      inst.id === installmentId ? { ...inst, status: 'PAID' as const } : inst
    );
    
    const allPaid = updatedInstallments.every(inst => inst.status === 'PAID');
    const somePaid = updatedInstallments.some(inst => inst.status === 'PAID');
    
    updateClientPayment(paymentId, { 
      installments: updatedInstallments,
      status: allPaid ? 'PAID' : (somePaid ? 'PARTIAL' : 'PENDING')
    });
  };

  const filteredPayments = useMemo(() => {
    const term = (searchTerm || '').toLowerCase().trim();
    if (!term) return clientPayments || [];
    return (clientPayments || []).filter(p => 
      (p.clientName || '').toLowerCase().includes(term) || 
      (p.description || '').toLowerCase().includes(term)
    );
  }, [clientPayments, searchTerm]);

  const { totalPaid, totalPending } = useMemo(() => {
    let paid = 0;
    let pending = 0;

    (clientPayments || []).forEach(p => {
      if (p.isInstallmentPlan && p.installments && p.installments.length > 0) {
        p.installments.forEach(inst => {
          if (inst.status === 'PAID') {
            paid += inst.amount;
          } else {
            pending += inst.amount;
          }
        });
      } else {
        if (p.status === 'PAID') {
          paid += p.amount;
        } else {
          pending += p.amount;
        }
      }
    });

    return { totalPaid: paid, totalPending: pending };
  }, [clientPayments]);

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Financeiro de Clientes</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Gestão de pagamentos e recebimentos.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Pagamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Recebido</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">A Receber</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por cliente ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Cliente</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Descrição</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Vencimento</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Valor</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <React.Fragment key={payment.id}>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-6 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{payment.clientName}</span>
                    </td>
                    <td className="py-4 px-6 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-2">
                        {payment.description}
                        {payment.isInstallmentPlan && (
                          <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-bold">
                            <Layers className="w-3 h-3" />
                            {payment.installments?.length} Parcelas
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                      {formatDateSafe(payment.dueDate)}
                    </td>
                    <td className="py-4 px-6 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100">
                      R$ {payment.amount.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-4 px-6 border-b border-slate-100 dark:border-slate-800">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        payment.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' :
                        payment.status === 'PARTIAL' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400' :
                        payment.status === 'OVERDUE' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' :
                        'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                      )}>
                        {payment.status === 'PAID' ? 'Pago' : payment.status === 'PARTIAL' ? 'Parcial' : payment.status === 'OVERDUE' ? 'Atrasado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="py-4 px-6 border-b border-slate-100 dark:border-slate-800 text-right">
                      {payment.isInstallmentPlan ? (
                        <button
                          onClick={() => toggleExpand(payment.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2"
                        >
                          {expandedPayments.includes(payment.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      ) : (
                        payment.status !== 'PAID' && (
                          <button 
                            onClick={() => updateClientPayment(payment.id, { status: 'PAID' })}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-4 py-2 rounded-xl font-bold text-xs"
                          >
                            Marcar Pago
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                  
                  {payment.isInstallmentPlan && expandedPayments.includes(payment.id) && (
                    <tr>
                      <td colSpan={6} className="bg-slate-50/50 dark:bg-slate-800/30 p-0 border-b border-slate-100 dark:border-slate-800">
                        <div className="px-6 py-4">
                          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Detalhamento das Parcelas</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {payment.installments?.map(inst => (
                              <div key={inst.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                    Parcela {inst.number}
                                  </div>
                                  <div className="font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                                    R$ {inst.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Vence: {formatDateSafe(inst.dueDate)}
                                  </div>
                                </div>
                                <div>
                                  {inst.status === 'PAID' ? (
                                    <span className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center">
                                      <CheckCircle2 className="w-4 h-4" />
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleInstallmentPaid(payment.id, inst.id)}
                                      className="text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                      Pagar
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                    Nenhum pagamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Novo Pagamento</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-4">Cliente</label>
                <select
                  required
                  value={newPayment.clientId}
                  onChange={e => setNewPayment({ ...newPayment, clientId: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all cursor-pointer"
                >
                  <option value="" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">Selecione um cliente...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-4">Descrição</label>
                <input 
                  type="text"
                  required
                  value={newPayment.description}
                  onChange={e => setNewPayment({ ...newPayment, description: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
                  placeholder="Ex: Pacote Europa 1ª Parcela"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-4">Valor Total (R$)</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newPayment.amount || ''}
                    onChange={e => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-4">Vencimento (1ª Parcela)</label>
                  <input 
                    type="date"
                    required
                    value={newPayment.dueDate}
                    onChange={e => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isInstallment" 
                  checked={isInstallment}
                  onChange={(e) => setIsInstallment(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <label htmlFor="isInstallment" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Parcelar pagamento
                </label>
              </div>

              {isInstallment && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-4">Número de Parcelas</label>
                  <input 
                    type="number"
                    min="2"
                    max="48"
                    value={installmentCount}
                    onChange={e => setInstallmentCount(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all"
                  />
                </div>
              )}
              
              <button 
                type="submit" 
                className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                Registrar Pagamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
