import React from 'react';
import { Plane } from 'lucide-react';

export default function LoadingScreen({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400 animate-pulse">
          <Plane className="w-7 h-7 animate-bounce" />
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
        {message}
      </p>
    </div>
  );
}
