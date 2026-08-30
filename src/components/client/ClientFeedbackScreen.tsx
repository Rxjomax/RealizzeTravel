import React, { useState } from 'react';
import { Star, Send, CheckCircle2, MessageSquare, ThumbsUp } from 'lucide-react';
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
      itineraryId: 'current',
      rating,
      comment,
      date: new Date().toISOString()
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-slate-950 pb-12 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center max-w-sm mx-auto space-y-4">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Avaliação Enviada</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Muito obrigado pela sua opinião. Ela é fundamental para aperfeiçoarmos cada detalhe dos nossos roteiros e atendimento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 pb-12 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 rounded-xl text-blue-600 dark:text-blue-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Avalie sua Experiência</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Conte-nos como foi viajar com a nossa assessoria</p>
            </div>
          </div>
        </div>

        {/* Feedback Form Card */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col items-center text-center space-y-3 pb-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Como você avalia a sua viagem?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 transition-transform hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
                >
                  <Star 
                    className={`w-9 h-9 transition-colors ${
                      (hoverRating || rating) >= star 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-slate-200 dark:text-slate-700'
                    }`} 
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {rating === 5 ? 'Excelente!' : rating === 4 ? 'Muito boa!' : rating === 3 ? 'Regular' : rating === 2 ? 'Deixou a desejar' : 'Insatisfeito'}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Comentários e sugestões (opcional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="O que você mais gostou? O que podemos fazer para tornar a sua próxima viagem ainda melhor?"
              rows={4}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Avaliação</span>
          </button>
        </form>
      </div>
    </div>
  );
}
