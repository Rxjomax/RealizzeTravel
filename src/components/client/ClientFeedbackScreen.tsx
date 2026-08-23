import React, { useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ClientFeedbackScreen() {
  const { addFeedback, currentUserEmail, clients } = useApp();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const client = clients.find(c => c.email === currentUserEmail) || { name: 'Viajante', email: currentUserEmail };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert("Por favor, selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    addFeedback({
      id: `feedback_${Date.now()}`,
      clientId: client.id || 'unknown',
      clientName: client.name,
      itineraryId: 'current', // Could be dynamic if we had multiple itineraries per client
      rating,
      comment,
      date: new Date().toISOString()
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-slate-950 px-6 pt-12 pb-8 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm text-center max-w-sm mx-auto border border-slate-100 dark:border-slate-800">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Muito Obrigado!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Sua avaliação foi enviada com sucesso e é muito importante para melhorarmos nossos serviços.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 px-6 pt-12 pb-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">Avalie sua Experiência</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Conte-nos como foi viajar conosco e o que podemos melhorar.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="mb-8 flex flex-col items-center">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Como você avalia nossa agência?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-2 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      (hoverRating || rating) >= star 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-slate-200 dark:text-slate-700'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block pl-4">Deixe um comentário (opcional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="O que você mais gostou? O que poderíamos fazer melhor?"
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400 resize-none h-32"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Enviar Avaliação
          </button>
        </form>
      </div>
    </div>
  );
}
