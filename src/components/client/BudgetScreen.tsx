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
  
  // Find itinerary for current logged-in user
  const userItineraries = itineraries.filter(it => it.clientEmail === currentUserEmail);
  const activeItinerary = userItineraries.length > 0 ? userItineraries[0] : itineraries[0];
  const autoCurrency = detectCurrencyFromDestination(activeItinerary?.destination);

  const storageKey = `trip_expenses_${currentUserEmail || 'default'}`;

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(expenses));
    } catch (e) {
      console.warn("Error saving expenses:", e);
    }
  }, [expenses, storageKey]);
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

  const budgetLimit = 5000;
  const currentTotal = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const percentage = Math.min((currentTotal / budgetLimit) * 100, 100);

  // Synchronize auto currency when activeItinerary updates
  useEffect(() => {
    if (autoCurrency) {
      setExpenseCurrency(autoCurrency);
      setFromCurrency(autoCurrency);
    }
  }, [autoCurrency]);

  // Fetch live exchange rates automatically
  const fetchLiveRates = async () => {
    setIsLoadingRates(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/BRL');
      if (res.ok) {
        const data = await res.json();
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
    const toRateInBRL = rates[toCurrency] || 1;
    const val = parseFloat(converterAmount) || 0;
    return (val * fromRateInBRL) / toRateInBRL;
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add converted expense directly
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
    <div className="min-h-full bg-slate-50 px-4 md:px-8 py-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header & Destination Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Gastos & Moedas</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Controle seu orçamento de viagem em tempo real.</p>
          </div>

          {activeItinerary?.destination && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-sm self-start sm:self-auto">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Destino da Viagem</p>
                <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{activeItinerary.destination}</p>
              </div>
            </div>
          )}
        </div>

        {/* Classic Budget Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-7 text-white shadow-xs">
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-400" />
              </div>
              <span className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-md text-xs font-semibold">
                Orçamento Previsto: R$ {budgetLimit.toFixed(2)}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Gasto na Viagem</p>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                R$ {currentTotal.toFixed(2)}
              </h2>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>{percentage.toFixed(0)}% do limite utilizado</span>
                <span>Saldo Restante: R$ {(budgetLimit - currentTotal).toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    percentage > 85 ? "bg-red-500" : percentage > 60 ? "bg-amber-400" : "bg-emerald-500"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Automatic Live Currency Exchange Banner */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">Conversão de Moedas em Tempo Real</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Cotação comercial ({autoCurrency}): <strong className="text-slate-900 dark:text-slate-100">1 {autoCurrency} = R$ {(rates[autoCurrency] || 1).toFixed(2)}</strong>
                </p>
              </div>
            </div>

            <button 
              onClick={fetchLiveRates}
              disabled={isLoadingRates}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-all"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoadingRates && "animate-spin")} />
              {isLiveRates ? 'Ao Vivo' : 'Atualizar'}
            </button>
          </div>

          {/* Quick Conversion Inputs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <div className="flex-1 w-full bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Valor em {fromCurrency}</label>
                <select 
                  value={fromCurrency} 
                  onChange={e => setFromCurrency(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
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
                className="w-full bg-transparent text-xl font-bold text-slate-900 dark:text-slate-100 outline-none" 
              />
            </div>

            <button 
              onClick={handleSwapCurrencies}
              className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all active:translate-y-0.5 shrink-0"
              title="Inverter Moedas"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 w-full bg-emerald-50/60 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900 p-3">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase">Equivalente em {toCurrency}</label>
                <select 
                  value={toCurrency} 
                  onChange={e => setToCurrency(e.target.value)}
                  className="bg-transparent text-xs font-bold text-emerald-950 dark:text-emerald-100 outline-none cursor-pointer"
                >
                  {Object.keys(rates).map(c => (
                    <option key={c} value={c} className="dark:bg-slate-900">{CURRENCY_NAMES[c] || c}</option>
                  ))}
                </select>
              </div>
              <div className="text-xl font-bold text-emerald-950 dark:text-emerald-100 truncate">
                {getConvertedNumber().toFixed(2)} <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{toCurrency}</span>
              </div>
            </div>

            <button
              onClick={handleAddConvertedAsExpense}
              className="w-full sm:w-auto px-4 py-3 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg shadow-xs transition-all active:translate-y-0.5 flex items-center justify-center gap-1.5 shrink-0 border border-slate-900 dark:border-slate-100"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              Lançar Gasto
            </button>
          </div>
        </div>

        {/* Add Expense Form */}
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center">
              <Plus className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" /> Registrar Novo Gasto Manual
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">Moeda</label>
              <select
                value={expenseCurrency}
                onChange={e => setExpenseCurrency(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {Object.keys(rates).map(c => (
                  <option key={c} value={c} className="dark:bg-slate-900">{CURRENCY_NAMES[c] || c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">Valor ({expenseCurrency})</label>
              <input 
                type="number" 
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">Descrição</label>
              <input 
                type="text" 
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Ex: Almoço, Táxi"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
              />
            </div>
          </div>

          {expenseCurrency !== 'BRL' && amount && (
            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between">
              <span>Valor convertido em Reais:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-bold">
                R$ {((parseFloat(amount) || 0) * (rates[expenseCurrency] || 1)).toFixed(2)}
              </strong>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs rounded-lg transition-all active:translate-y-0.5 shadow-xs border border-slate-900 dark:border-slate-100"
          >
            Adicionar ao Orçamento
          </button>
        </form>

        {/* Expense History List */}
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider mb-3 px-0.5">Histórico de Lançamentos</h3>
          {expenses.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs text-center">
              <Receipt className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Nenhum gasto registrado ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map(exp => (
                <div key={exp.id} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl flex items-center justify-between border border-slate-200/90 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-50 dark:bg-rose-950/50 p-2 rounded-lg text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900 shrink-0">
                      <ArrowDownCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{exp.description}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(exp.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs shrink-0">
                    - R$ {exp.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
