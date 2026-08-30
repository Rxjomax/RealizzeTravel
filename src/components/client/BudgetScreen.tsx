import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownCircle, Plus, Receipt, ArrowRightLeft, DollarSign, RefreshCw, Check, Sparkles, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Expense } from '../../types';
import { useApp } from '../../context/AppContext';

// Default fallback rates relative to BRL (1 foreign currency = X BRL)
const INITIAL_RATES_IN_BRL: Record<string, number> = {
  'BRL': 1.00,
  'USD': 5.65,
  'EUR': 6.15,
  'GBP': 7.25,
  'JPY': 0.038,
  'CAD': 4.12,
  'AUD': 3.72,
  'CHF': 6.35,
  'ARS': 0.0058,
  'CLP': 0.0060,
  'MXN': 0.31
};

const CURRENCY_NAMES: Record<string, string> = {
  'BRL': 'Real (R$)',
  'USD': 'Dólar Americano ($)',
  'EUR': 'Euro (€)',
  'GBP': 'Libra Esterlina (£)',
  'JPY': 'Iene Japonês (¥)',
  'CAD': 'Dólar Canadense (C$)',
  'AUD': 'Dólar Australiano (A$)',
  'CHF': 'Franco Suíço (CHF)',
  'ARS': 'Peso Argentino ($)',
  'CLP': 'Peso Chileno ($)',
  'MXN': 'Peso Mexicano ($)'
};

const detectCurrencyFromDestination = (destination?: string): string => {
  if (!destination) return 'EUR';
  const dest = destination.toLowerCase();
  if (dest.includes('orlando') || dest.includes('eua') || dest.includes('usa') || dest.includes('miami') || dest.includes('york') || dest.includes('estados unidos')) return 'USD';
  if (dest.includes('londres') || dest.includes('inglaterra') || dest.includes('reino unido') || dest.includes('uk')) return 'GBP';
  if (dest.includes('tóquio') || dest.includes('toquio') || dest.includes('japão') || dest.includes('japao')) return 'JPY';
  if (dest.includes('buenos aires') || dest.includes('argentina')) return 'ARS';
  if (dest.includes('santiago') || dest.includes('chile')) return 'CLP';
  if (dest.includes('cancun') || dest.includes('cancún') || dest.includes('méxico') || dest.includes('mexico')) return 'MXN';
  return 'EUR';
};

export default function BudgetScreen() {
  const { itineraries, currentUserEmail } = useApp();
  
  const userItinerariesOk = itineraries.filter(it => it.clientEmail === currentUserEmail);
  const activeItinerary = userItinerariesOk.length > 0 ? userItinerariesOk[0] : itineraries[0];
  const autoCurrency = detectCurrencyFromDestination(activeItinerary?.destination);

  const storageKey四周 = `trip_expenses_${currentUserEmail || 'default'}`;

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey四周);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey四周, JSON.stringify(expenses));
    } catch (e) {
      console.warn("Error saving expenses:", e);
    }
  }, [expenses, storageKey四周]);

  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [expenseCurrency, setExpenseCurrency] = useState(autoCurrency);
  
  // Currency Converter State
  const [converterAmount, setConverterAmount] = useState('50');
  const [fromCurrency, setFromCurrency] = useState(autoCurrency);
  const [toCurrency, setToCurrency] = useState('BRL');
  const [rates, setRates] = useState<Record<string, number>>(INITIAL_RATES_IN_BRL);
  const [isLiveRates, setIsLiveRates] = useState(false);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const budgetLimit四周 = 5000;
  const currentTotal = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const percentage = Math.min((currentTotal / budgetLimit四周) * 100, 100);

  useEffect(() => {
    if (autoCurrency) {
      setExpenseCurrency(autoCurrency);
      setFromCurrency(autoCurrency);
    }
  }, [autoCurrency]);

  const fetchLiveRates = async () => {
    setIsLoadingRates(true);
    try {
      const res拼 = await fetch('https://open.er-api.com/v6/latest/BRL');
      if (res拼.ok) {
        const data = await res拼.json();
        const newRates: Record<string, number> = { BRL: 1.00 };
        Object.keys(INITIAL_RATES_IN_BRL).forEach(code => {
          if (data.rates && data.rates[code] && data.rates[code] > 0) {
            newRates[code] = 1 / data.rates[code];
          } else {
            newRates[code] = INITIAL_RATES_IN_BRL[code];
          }
        });
        setRates(newRates);
        setIsLiveRates(true);
      }
    } catch (err) {
      console.warn('Usando cotação comercial local:', err);
      setRates(INITIAL_RATES_IN_BRL);
      setIsLiveRates(false);
    } finally {
      setIsLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchLiveRates();
  }, []);

  const getConvertedNumber = () => {
    const fromRateInBRL = rates[fromCurrency] || 1;
    const toRateInBRL拼 = rates[toCurrency] || 1;
    const val = parseFloat(converterAmount) || 0;
    return (val * fromRateInBRL) / toRateInBRL拼;
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddConvertedAsExpense = () => {
    const valInBRL = fromCurrency === 'BRL' 
      ? (parseFloat(converterAmount) || 0) 
      : (parseFloat(converterAmount) || 0) * (rates[fromCurrency] || 1);

    if (valInBRL <= 0) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: `Gasto em ${fromCurrency}: ${converterAmount} ${fromCurrency}`,
      amount: parseFloat(valInBRL.toFixed(2)),
      currency: 'BRL',
      date: new Date().toISOString(),
    };

    setExpenses([newExpense, ...expenses]);
    triggerToast(`Gasto de R$ ${valInBRL.toFixed(2)} adicionado!`);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) return;
    
    const inputVal = parseFloat(amount);
    const rateInBRL = rates[expenseCurrency] || 1;
    const finalValInBRL = inputVal * rateInBRL;
    
    const newExpense: Expense = {
      id: Date.now().toString(),
      description: expenseCurrency !== 'BRL' ? `${desc} (${inputVal.toFixed(2)} ${expenseCurrency})` : desc,
      amount: parseFloat(finalValInBRL.toFixed(2)),
      currency: 'BRL',
      date: new Date().toISOString(),
    };
    
    setExpenses([newExpense, ...expenses]);
    setAmount('');
    setDesc('');
    triggerToast('Despesa lançada com sucesso!');
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-8 relative text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Gastos & Câmbio
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Monitore seu orçamento da viagem e faça conversões em tempo real.
            </p>
          </div>

          {activeItinerary?.destination && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs self-start sm:self-auto">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Destino: {activeItinerary.destination}</span>
            </div>
          )}
        </header>

        {/* Budget Overview Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Orçamento Planejado</span>
              </div>
              <span className="text-xs font-extrabold text-white bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                R$ {budgetLimit四周.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <p className="text-xs font-medium text-blue-100/80 uppercase tracking-wider mb-1">Total Gasto na Viagem</p>
              <div className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                R$ {currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/15">
              <div className="flex justify-between text-xs font-semibold text-blue-100">
                <span>{percentage.toFixed(0)}% utilizado</span>
                <span>Saldo restante: R$ {(budgetLimit四周 - currentTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/20">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    percentage > 85 ? "bg-amber-400" : "bg-emerald-400"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Currency Converter */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-2xl text-blue-600 dark:text-blue-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Conversor de Moedas</h2>
                <p className="text-xs text-slate-500 font-medium">
                  1 {autoCurrency} = R$ {(rates[autoCurrency] || 1).toFixed(2)}
                </p>
              </div>
            </div>

            <button 
              onClick={fetchLiveRates}
              disabled={isLoadingRates}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900 transition-all cursor-pointer"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoadingRates && "animate-spin")} />
              <span>{isLiveRates ? 'Cotação Comercial (Ao Vivo)' : 'Atualizar Cotação'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-3.5">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Origem ({fromCurrency})</label>
                <select 
                  value={fromCurrency} 
                  onChange={e => setFromCurrency(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                >
                  {Object.keys(rates).map(c => (
                    <option key={c} value={c} className="dark:bg-slate-900">{CURRENCY_NAMES[c] || c}</option>
                  ))}
                </select>
              </div>
              <input 
                type="number" 
                value={converterAmount} 
                onChange={e => setConverterAmount(e.target.value)}
                className="w-full bg-transparent text-2xl font-black text-slate-900 dark:text-slate-100 outline-none" 
              />
            </div>

            <button 
              onClick={handleSwapCurrencies}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95 shrink-0 self-center cursor-pointer shadow-xs"
              title="Inverter Moedas"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/60 p-3.5">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Destino ({toCurrency})</label>
                <select 
                  value={toCurrency} 
                  onChange={e => setToCurrency(e.target.value)}
                  className="bg-transparent text-xs font-bold text-blue-700 dark:text-blue-300 outline-none cursor-pointer"
                >
                  {Object.keys(rates).map(c => (
                    <option key={c} value={c} className="dark:bg-slate-900">{CURRENCY_NAMES[c] || c}</option>
                  ))}
                </select>
              </div>
              <div className="text-2xl font-black text-blue-950 dark:text-blue-100 truncate">
                {getConvertedNumber().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-bold text-blue-500">{toCurrency}</span>
              </div>
            </div>

            <button
              onClick={handleAddConvertedAsExpense}
              className="w-full sm:w-auto px-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all active:scale-95 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Gasto</span>
            </button>
          </div>
        </div>

        {/* Add Expense Form */}
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Lançar Nova Despesa Manual
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Moeda</label>
              <select
                value={expenseCurrency}
                onChange={e => setExpenseCurrency(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {Object.keys(rates).map(c => (
                  <option key={c} value={c} className="dark:bg-slate-900">{CURRENCY_NAMES[c] || c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Valor ({expenseCurrency})</label>
              <input 
                type="number" 
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Descrição</label>
              <input 
                type="text" 
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Ex: Jantar, Táxi, Passeio"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold text-xs rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            Adicionar ao Histórico
          </button>
        </form>

        {/* Expense History List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Histórico de Gastos</h2>
          {expenses.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
              <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Nenhum gasto registrado ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map(exp => (
                <article key={exp.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
                      <ArrowDownCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{exp.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(exp.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 shrink-0">
                    - R$ {exp.amount.toFixed(2)}
                  </span>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
