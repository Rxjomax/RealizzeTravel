#!/bin/bash
cat << 'INNER_EOF' > /tmp/crm_patch.js
const fs = require('fs');
const file = 'src/components/admin/ClientCRMScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add updateClient to useApp
code = code.replace(
  "const { clients, addClient, addClientDocument, clientDocuments } = useApp();",
  "const { clients, addClient, updateClient, addClientDocument, clientDocuments } = useApp();"
);

// 2. Add state for editingClient
code = code.replace(
  "const [isModalOpen, setIsModalOpen] = useState(false);",
  "const [isModalOpen, setIsModalOpen] = useState(false);\n  const [editingClient, setEditingClient] = useState<any>(null);"
);

// 3. Edit button onClick handler
code = code.replace(
  "<button className=\"px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold transition-colors\">\n                    Editar Perfil\n                  </button>",
  `<button onClick={() => setEditingClient(client)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold transition-colors">
                    Editar Perfil
                  </button>`
);

// 4. Add Edit Modal below Create Client Modal
const editModalCode = `
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
`;

code = code.replace(
  "    </div>\n  );\n}",
  editModalCode + "\n    </div>\n  );\n}"
);

fs.writeFileSync(file, code);
INNER_EOF
node /tmp/crm_patch.js
