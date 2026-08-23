import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckSquare, Clock, CheckCircle2, Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AgencyTask } from '../../types';

export default function AdminTasksScreen() {
  const { agencyTasks, addAgencyTask, updateAgencyTask } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<AgencyTask>>({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    status: 'PENDING'
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.dueDate || !newTask.assignee) return;
    addAgencyTask({
      id: `task_${Date.now()}`,
      title: newTask.title,
      description: newTask.description || '',
      assignee: newTask.assignee,
      dueDate: newTask.dueDate,
      status: 'PENDING'
    });
    setNewTask({ title: '', description: '', assignee: '', dueDate: '', status: 'PENDING' });
    setIsModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'IN_PROGRESS': return 'Em Progresso';
      case 'COMPLETED': return 'Concluída';
      default: return status;
    }
  };

  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return 'Sem data';
    try {
      const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Tarefas Internas</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">To-Do List da agência para gestão da equipe.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Tarefa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map(status => (
          <div key={status} className="bg-slate-100/70 dark:bg-slate-900/70 rounded-[2rem] p-4 flex flex-col gap-4 border border-slate-200/60 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between px-2">
              {getStatusLabel(status)}
              <span className="bg-white text-slate-500 text-xs py-1 px-2 rounded-full shadow-sm">
                {agencyTasks.filter(t => t.status === status).length}
              </span>
            </h3>
            <div className="flex flex-col gap-3">
              {agencyTasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-1">{task.title}</h4>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatDateSafe(task.dueDate)}
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {task.assignee}
                    </div>
                  </div>

                  {status !== 'COMPLETED' && (
                    <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2">
                      {status === 'PENDING' && (
                        <button 
                          onClick={() => updateAgencyTask(task.id, { status: 'IN_PROGRESS' })}
                          className="flex-1 text-xs font-bold text-blue-600 bg-blue-50 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                          Iniciar
                        </button>
                      )}
                      <button 
                        onClick={() => updateAgencyTask(task.id, { status: 'COMPLETED' })}
                        className="flex-1 text-xs font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl hover:bg-emerald-100 transition-colors flex justify-center items-center gap-1"
                      >
                        <CheckSquare className="w-3 h-3" />
                        Concluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Nova Tarefa</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Título</label>
                <input 
                  type="text"
                  required
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  placeholder="Ex: Emitir passagens"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Descrição</label>
                <textarea 
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400 resize-none h-24"
                  placeholder="Detalhes da tarefa..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Responsável</label>
                  <input 
                    type="text"
                    required
                    value={newTask.assignee}
                    onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                    placeholder="Nome"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Prazo</label>
                  <input 
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-900 transition-all"
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                Criar Tarefa
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
