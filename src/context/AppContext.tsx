import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Feedback, Itinerary, User, AgencyTask, ClientPayment, AuditLog, SystemLicense } from '../types';
import { MOCK_ITINERARY, MOCK_FEEDBACKS } from '../data';

interface AppContextType {
  itineraries: Itinerary[];
  addItinerary: (itinerary: Itinerary) => Promise<void>;
  deleteItinerary: (id: string) => Promise<void>;
  feedbacks: Feedback[];
  addFeedback: (feedback: Feedback) => Promise<void>;
  clients: any[];
  updateClient: (id: string, updates: any) => Promise<void>;
  addClient: (client: any) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  currentUserEmail: string | null;
  setCurrentUserEmail: (email: string | null) => void;
  globalAlert: string | null;
  setGlobalAlert: (alert: string | null) => void;
  clientAlerts: any[];
  addClientAlert: (alert: any) => Promise<void>;
  resolveClientAlert: (id: string) => Promise<void>;
  clientDocuments: any[];
  addClientDocument: (doc: any) => Promise<void>;
  kpis: any;
  updateKpis: (kpis: any) => void;
  agencyTasks: AgencyTask[];
  addAgencyTask: (task: AgencyTask) => Promise<void>;
  updateAgencyTask: (id: string, updates: Partial<AgencyTask>) => Promise<void>;
  deleteAgencyTask: (id: string) => Promise<void>;
  clientPayments: ClientPayment[];
  addClientPayment: (payment: ClientPayment) => Promise<void>;
  updateClientPayment: (id: string, updates: Partial<ClientPayment>) => Promise<void>;
  deleteClientPayment: (id: string) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  // Master / Developer Surveillance & Licensing
  auditLogs: AuditLog[];
  logAuditEvent: (actionType: AuditLog['actionType'], targetName?: string, details?: string, metadata?: Record<string, any>) => Promise<void>;
  systemLicense: SystemLicense;
  updateSystemLicense: (updates: Partial<SystemLicense>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_LICENSE: SystemLicense = {
  id: 'license_config',
  status: 'ACTIVE',
  agencyName: 'Agência Premium VIP Turismo',
  planName: 'Plano Pro Master (Mensal)',
  expiresAt: '2026-12-31',
  monthlyFee: 350.00,
  currency: 'BRL',
  suspensionReason: 'Mensalidade de software pendente. Entre em contato com o desenvolvedor para desbloqueio.',
  contactDevEmail: 'dev@master.com',
  contactDevWhatsapp: '+55 (11) 99999-8888',
  updatedAt: new Date().toISOString()
};

const INITIAL_CLIENTS = [
  {
    id: 'master_dev_1',
    name: 'Desenvolvedor Master (Supremo)',
    email: 'dev@master.com',
    role: 'SUPER_ADMIN',
    password: 'masterdev2026',
  },
  {
    id: 'admin_1',
    name: 'Admin Agência',
    email: 'admin@agencia.com',
    role: 'ADMIN',
    password: 'admin',
  },
  {
    id: '1',
    name: 'Carolina Mendes',
    email: 'carolina@example.com',
    role: 'CLIENT',
    preferences: {
      seat: 'Janela',
      diet: 'Vegetariana',
      hotel: 'Boutique/Design',
      interests: ['Arte', 'Gastronomia', 'História'],
    },
    lastTrip: 'Paris, França',
    nextTrip: 'Roma, Itália',
    tripStatus: 'Em Planejamento',
    notes: 'Sempre pedir check-in antecipado. Gosta de vinhos locais.'
  },
  {
    id: '2',
    name: 'Marcos e Silvia',
    email: 'familia.silvia@example.com',
    role: 'CLIENT',
    preferences: {
      seat: 'Corredor (Juntos)',
      diet: 'Sem restrições',
      hotel: 'Resort Familiar',
      interests: ['Parques', 'Piscina', 'Compras'],
    },
    lastTrip: 'Orlando, EUA',
    nextTrip: 'Nenhuma viagem planejada',
    tripStatus: 'Nenhuma',
    notes: 'Viajam com duas crianças (7 e 10 anos). Precisam de quartos conectados.'
  },
  {
    id: '3',
    name: 'Dr. Roberto Almeida',
    email: 'roberto.almeida@example.com',
    role: 'CLIENT',
    preferences: {
      seat: 'Corredor (Frente)',
      diet: 'Low Carb',
      hotel: 'Business 5 Estrelas',
      interests: ['Negócios', 'Golfe', 'SPA'],
    },
    lastTrip: 'Nova York, EUA',
    nextTrip: 'Tóquio, Japão',
    tripStatus: 'Em Andamento',
    notes: 'Prioriza agilidade e conforto extremo. Odeia conexões longas.'
  }
];

const INITIAL_TASKS = [
  {
    id: 'task_1',
    title: 'Emitir passagens Família Silva',
    description: 'Voo GRU-MIA dia 15/10. Confirmar assentos juntos.',
    assignee: 'João Pedro',
    dueDate: '2026-08-01',
    status: 'PENDING'
  },
  {
    id: 'task_2',
    title: 'Reservar hotel Carolina Mendes',
    description: 'Checar disponibilidade no Hotel Le Meurice, Paris.',
    assignee: 'Ana Maria',
    dueDate: '2026-07-28',
    status: 'IN_PROGRESS'
  }
];

const INITIAL_PAYMENTS = [
  {
    id: 'pay_1',
    clientId: '1',
    clientName: 'Carolina Mendes',
    description: 'Pacote Paris (Entrada)',
    amount: 15000,
    dueDate: '2026-07-30',
    status: 'PENDING'
  },
  {
    id: 'pay_2',
    clientId: '2',
    clientName: 'Marcos e Silvia',
    description: 'Pacote Orlando (Integral)',
    amount: 45000,
    dueDate: '2026-07-15',
    status: 'PAID'
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));
  const [globalAlert, setGlobalAlert] = useState<string | null>(null);
  const [clientAlerts, setClientAlerts] = useState<any[]>([]);
  const [clientDocuments, setClientDocuments] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('client_docs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [kpis, setKpis] = useState({
    revenue: 45000,
    activeTrips: 12,
    satisfaction: 4.9,
    growth: 15
  });

  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [agencyTasks, setAgencyTasks] = useState<AgencyTask[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemLicense, setSystemLicense] = useState<SystemLicense>(INITIAL_LICENSE);

  // Audit Logger Helper
  const logAuditEvent = useCallback(async (
    actionType: AuditLog['actionType'],
    targetName: string = '',
    details: string = '',
    metadata: Record<string, any> = {}
  ) => {
    const userRole = localStorage.getItem('userRole') || 'ADMIN';
    const userEmail = localStorage.getItem('userEmail') || 'admin@agencia.com';
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const newLog: AuditLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      userEmail,
      userName: userRole === 'SUPER_ADMIN' ? 'Desenvolvedor Master' : (userRole === 'ADMIN' ? 'Admin Agência' : 'Passageiro'),
      userRole,
      actionType,
      targetName,
      details,
      metadata
    };

    setAuditLogs(prev => [newLog, ...prev]);

    try {
      await setDoc(doc(db, 'auditLogs', logId), newLog);
    } catch (err) {
      console.warn("Aviso ao salvar log de auditoria no Firestore:", err);
    }
  }, []);

  // Update System License
  const updateSystemLicense = useCallback(async (updates: Partial<SystemLicense>) => {
    setSystemLicense(prev => {
      const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      return updated;
    });
    try {
      await setDoc(doc(db, 'systemConfig', 'license'), { ...systemLicense, ...updates, updatedAt: new Date().toISOString() }, { merge: true });
      await logAuditEvent('LICENSE_CHANGE', 'Configuração de Licença', `Status alterado para: ${updates.status || systemLicense.status}`);
    } catch (err) {
      console.warn("Aviso ao atualizar licença no Firestore:", err);
    }
  }, [systemLicense, logAuditEvent]);

  // Seed Data Logic (Run once if collections are empty)
  useEffect(() => {
    const seedData = async () => {
      try {
        const clientsSnap = await getDocs(collection(db, 'users'));
        let adminExists = false;
        let masterExists = false;
        
        if (clientsSnap.empty) {
          for (const c of INITIAL_CLIENTS) {
            await setDoc(doc(db, 'users', c.id), c, { merge: true });
          }
          adminExists = true;
          masterExists = true;
        } else {
          clientsSnap.forEach(doc => {
            if (doc.data().email === 'admin@agencia.com') adminExists = true;
            if (doc.data().email === 'dev@master.com') masterExists = true;
          });
        }
        
        if (!adminExists) {
          const adminClient = INITIAL_CLIENTS.find(c => c.email === 'admin@agencia.com');
          if (adminClient) {
            await setDoc(doc(db, 'users', adminClient.id), { ...adminClient, password: 'admin' }, { merge: true });
          }
        }

        if (!masterExists) {
          const masterClient = INITIAL_CLIENTS.find(c => c.email === 'dev@master.com');
          if (masterClient) {
            await setDoc(doc(db, 'users', masterClient.id), { ...masterClient, password: 'masterdev2026' }, { merge: true });
          }
        }

        // License doc
        const licenseSnap = await getDocs(collection(db, 'systemConfig'));
        if (licenseSnap.empty) {
          await setDoc(doc(db, 'systemConfig', 'license'), INITIAL_LICENSE);
        }
        
        const tasksSnap = await getDocs(collection(db, 'agencyTasks'));
        if (tasksSnap.empty) {
          for (const t of INITIAL_TASKS) {
            await setDoc(doc(db, 'agencyTasks', t.id), t);
          }
        }

        const paymentsSnap = await getDocs(collection(db, 'clientPayments'));
        if (paymentsSnap.empty) {
          for (const p of INITIAL_PAYMENTS) {
            await setDoc(doc(db, 'clientPayments', p.id), p);
          }
        }

        const iterSnap = await getDocs(collection(db, 'itineraries'));
        if (iterSnap.empty) {
          await setDoc(doc(db, 'itineraries', MOCK_ITINERARY.id), {
            ...MOCK_ITINERARY,
            clientEmail: 'carolina@example.com'
          });
        }
        
        const feedSnap = await getDocs(collection(db, 'feedbacks'));
        if (feedSnap.empty) {
          for (const f of MOCK_FEEDBACKS) {
            await setDoc(doc(db, 'feedbacks', f.id), f);
          }
        }
      } catch (err) {
        console.error("Error seeding data", err);
      }
    };
    seedData();
  }, []);

  // Subscriptions
  useEffect(() => {
    const unsubClients = onSnapshot(collection(db, 'users'), (snap) => {
      setClients(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any)));
    }, (err) => console.warn("Firestore listener warning (users):", err));

    const unsubTasks = onSnapshot(collection(db, 'agencyTasks'), (snap) => {
      setAgencyTasks(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any)));
    }, (err) => console.warn("Firestore listener warning (agencyTasks):", err));

    const unsubPayments = onSnapshot(collection(db, 'clientPayments'), (snap) => {
      setClientPayments(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any)));
    }, (err) => console.warn("Firestore listener warning (clientPayments):", err));

    const unsubIter = onSnapshot(collection(db, 'itineraries'), (snap) => {
      setItineraries(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any)));
    }, (err) => console.warn("Firestore listener warning (itineraries):", err));

    const unsubFeed = onSnapshot(collection(db, 'feedbacks'), (snap) => {
      setFeedbacks(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any)));
    }, (err) => console.warn("Firestore listener warning (feedbacks):", err));

    const unsubAlerts = onSnapshot(collection(db, 'clientAlerts'), (snap) => {
      const list = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      setClientAlerts(list);
    }, (err) => console.warn("Firestore listener warning (clientAlerts):", err));

    const unsubDocs = onSnapshot(collection(db, 'clientDocuments'), (snap) => {
      const docsFromDb = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      if (docsFromDb.length > 0) {
        setClientDocuments(docsFromDb);
        try {
          localStorage.setItem('client_docs', JSON.stringify(docsFromDb));
        } catch (e) {
          console.warn("localStorage quota warning for docs:", e);
        }
      }
    }, (err) => console.warn("Firestore listener warning (clientDocuments):", err));

    const unsubLogs = onSnapshot(collection(db, 'auditLogs'), (snap) => {
      const logs = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as AuditLog));
      logs.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      setAuditLogs(logs);
    }, (err) => console.warn("Firestore listener warning (auditLogs):", err));

    const unsubLicense = onSnapshot(collection(db, 'systemConfig'), (snap) => {
      const licenseDoc = snap.docs.find(d => d.id === 'license');
      if (licenseDoc) {
        setSystemLicense(licenseDoc.data() as SystemLicense);
      }
    }, (err) => console.warn("Firestore listener warning (systemConfig):", err));

    return () => {
      unsubClients();
      unsubTasks();
      unsubPayments();
      unsubIter();
      unsubFeed();
      unsubAlerts();
      unsubDocs();
      unsubLogs();
      unsubLicense();
    };
  }, []);

  const updateKpis = useCallback((newKpis: any) => {
    setKpis((prev: any) => ({ ...prev, ...newKpis }));
  }, []);

  const addClient = useCallback(async (client: any) => {
    const newId = client.id || `client_${Date.now()}`;
    const newClientObj = {
      ...client,
      id: newId,
      role: client.role || 'CLIENT',
      password: client.password || '123456'
    };
    setClients(prev => {
      const exists = prev.some(c => c.id === newId || c.email === newClientObj.email);
      if (exists) {
        return prev.map(c => (c.id === newId || c.email === newClientObj.email) ? { ...c, ...newClientObj } : c);
      }
      return [...prev, newClientObj];
    });
    try {
      await setDoc(doc(db, 'users', newId), newClientObj, { merge: true });
      await logAuditEvent('CREATE_CLIENT', newClientObj.name, `E-mail: ${newClientObj.email} | Próxima Viagem: ${newClientObj.nextTrip || 'Não definida'}`);
    } catch (err) {
      console.warn("Aviso ao cadastrar cliente no Firestore:", err);
    }
  }, [logAuditEvent]);

  const updateClient = useCallback(async (id: string, updates: any) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      await setDoc(doc(db, 'users', id), updates, { merge: true });
      const client = clients.find(c => c.id === id);
      await logAuditEvent('UPDATE_CLIENT', client?.name || id, `Dados do cliente atualizados`);
    } catch (err) {
      console.warn("Aviso ao atualizar cliente no Firestore:", err);
    }
  }, [clients, logAuditEvent]);

  const addItinerary = useCallback(async (itinerary: Itinerary) => {
    setItineraries(prev => {
      const exists = prev.some(i => i.id === itinerary.id);
      return exists ? prev.map(i => i.id === itinerary.id ? itinerary : i) : [itinerary, ...prev];
    });
    try {
      await setDoc(doc(db, 'itineraries', itinerary.id), itinerary);
      await logAuditEvent('CREATE_ITINERARY', itinerary.title, `Destino: ${itinerary.destination} | Cliente: ${itinerary.clientName} (${itinerary.activities?.length || 0} atividades)`);
      
      // Also sync nextTrip to the matched CRM client if applicable
      const matchedClient = clients.find(c => 
        (itinerary.clientEmail && c.email?.toLowerCase() === itinerary.clientEmail.toLowerCase()) ||
        (itinerary.clientName && c.name?.toLowerCase() === itinerary.clientName.toLowerCase())
      );
      if (matchedClient) {
        await updateClient(matchedClient.id, {
          nextTrip: itinerary.destination,
          tripStatus: 'Em Planejamento'
        });
      }
    } catch (err) {
      console.warn("Aviso ao salvar roteiro no Firestore:", err);
    }
  }, [clients, logAuditEvent, updateClient]);
  const deleteItinerary = useCallback(async (id: string) => {
    const item = itineraries.find(i => i.id === id);
    setItineraries(prev => prev.filter(i => i.id !== id));
    try {
      await deleteDoc(doc(db, 'itineraries', id));
      await logAuditEvent('DELETE_ITINERARY', item?.title || id, `Roteiro removido do sistema`);
    } catch (err) {
      console.warn("Aviso ao deletar roteiro no Firestore:", err);
    }
  }, [itineraries, logAuditEvent]);

  const addFeedback = useCallback(async (feedback: Feedback) => {
    setFeedbacks(prev => [feedback, ...prev]);
    try {
      await setDoc(doc(db, 'feedbacks', feedback.id), feedback);
      await logAuditEvent('LOGIN', feedback.clientName, `Feedback enviado - Nota ${feedback.rating}/5`);
    } catch (err) {
      console.warn("Aviso ao salvar feedback no Firestore:", err);
    }
  }, [logAuditEvent]);

  const deleteClient = useCallback(async (id: string) => {
    const item = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'users', id));
      await logAuditEvent('DELETE_CLIENT', item?.name || id, `Cliente removido do CRM`);
    } catch (err) {
      console.warn("Aviso ao deletar cliente no Firestore:", err);
    }
  }, [clients, logAuditEvent]);

  const addClientAlert = useCallback(async (alert: any) => {
    const alertId = alert.id || `sos_${Date.now()}`;
    const newAlertObj = { ...alert, id: alertId };
    setClientAlerts(prev => [newAlertObj, ...prev]);
    try {
      await setDoc(doc(db, 'clientAlerts', alertId), newAlertObj);
      await logAuditEvent('SOS_ALERT', alert.clientName || 'Cliente', `Alerta de Emergência SOS disparado`);
    } catch (err) {
      console.warn("Aviso ao registrar alerta SOS no Firestore:", err);
    }
  }, [logAuditEvent]);

  const resolveClientAlert = useCallback(async (id: string) => {
    setClientAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    try {
      await updateDoc(doc(db, 'clientAlerts', id), { resolved: true });
      await logAuditEvent('RESOLVE_ALERT', id, `Alerta SOS marcado como resolvido pelo Admin`);
    } catch (err) {
      console.warn("Aviso ao resolver alerta no Firestore:", err);
    }
  }, [logAuditEvent]);

  const addClientDocument = useCallback(async (docItem: any) => {
    const newDoc = { ...docItem, id: docItem.id || `doc_${Date.now()}` };
    setClientDocuments((prev) => {
      const updated = [newDoc, ...prev.filter(d => d.id !== newDoc.id)];
      try {
        localStorage.setItem('client_docs', JSON.stringify(updated));
      } catch (e) {
        console.warn("Aviso de cota do localStorage para documentos:", e);
      }
      return updated;
    });

    try {
      await setDoc(doc(db, 'clientDocuments', newDoc.id), newDoc);
      await logAuditEvent('UPLOAD_DOCUMENT', newDoc.title, `Tipo: ${newDoc.type} | Para: ${newDoc.clientEmail || 'Geral'}`);
    } catch (err) {
      console.warn("Aviso ao salvar documento no Firestore:", err);
    }
  }, [logAuditEvent]);

  const addAgencyTask = useCallback(async (task: AgencyTask) => {
    setAgencyTasks(prev => [task, ...prev]);
    try {
      await setDoc(doc(db, 'agencyTasks', task.id), task);
      await logAuditEvent('CREATE_TASK', task.title, `Responsável: ${task.assignee} | Prazo: ${task.dueDate}`);
    } catch (err) {
      console.warn("Aviso ao salvar tarefa no Firestore:", err);
    }
  }, [logAuditEvent]);

  const updateAgencyTask = useCallback(async (id: string, updates: Partial<AgencyTask>) => {
    setAgencyTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    try {
      await updateDoc(doc(db, 'agencyTasks', id), updates);
      await logAuditEvent('UPDATE_TASK', updates.title || id, `Status da tarefa alterado para: ${updates.status || 'Atualizado'}`);
    } catch (err) {
      console.warn("Aviso ao atualizar tarefa no Firestore:", err);
    }
  }, [logAuditEvent]);

  const deleteAgencyTask = useCallback(async (id: string) => {
    const item = agencyTasks.find(t => t.id === id);
    setAgencyTasks(prev => prev.filter(t => t.id !== id));
    try {
      await deleteDoc(doc(db, 'agencyTasks', id));
    } catch (err) {
      console.warn("Aviso ao deletar tarefa no Firestore:", err);
    }
  }, [agencyTasks]);

  const addClientPayment = useCallback(async (payment: ClientPayment) => {
    setClientPayments(prev => [payment, ...prev]);
    try {
      await setDoc(doc(db, 'clientPayments', payment.id), payment);
      await logAuditEvent('CREATE_PAYMENT', payment.clientName, `Valor: R$ ${payment.amount.toLocaleString('pt-BR')} | Descrição: ${payment.description} | Vencimento: ${payment.dueDate}`);
    } catch (err) {
      console.warn("Aviso ao registrar pagamento no Firestore:", err);
    }
  }, [logAuditEvent]);

  const updateClientPayment = useCallback(async (id: string, updates: Partial<ClientPayment>) => {
    setClientPayments(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    try {
      await updateDoc(doc(db, 'clientPayments', id), updates);
      await logAuditEvent('UPDATE_PAYMENT', updates.clientName || id, `Status de cobrança alterado para: ${updates.status || 'Atualizado'}`);
    } catch (err) {
      console.warn("Aviso ao atualizar pagamento no Firestore:", err);
    }
  }, [logAuditEvent]);

  const deleteClientPayment = useCallback(async (id: string) => {
    const item = clientPayments.find(p => p.id === id);
    setClientPayments(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, 'clientPayments', id));
    } catch (err) {
      console.warn("Aviso ao deletar pagamento no Firestore:", err);
    }
  }, [clientPayments]);

  const contextValue = useMemo(() => ({
    itineraries, addItinerary, deleteItinerary, feedbacks, addFeedback,
    clients, updateClient, addClient, deleteClient,
    currentUserEmail, setCurrentUserEmail, globalAlert, setGlobalAlert,
    clientAlerts, addClientAlert, resolveClientAlert, clientDocuments, addClientDocument,
    kpis, updateKpis, agencyTasks, addAgencyTask, updateAgencyTask, deleteAgencyTask,
    clientPayments, addClientPayment, updateClientPayment, deleteClientPayment,
    theme, toggleTheme,
    auditLogs, logAuditEvent,
    systemLicense, updateSystemLicense
  }), [
    itineraries, addItinerary, deleteItinerary, feedbacks, addFeedback,
    clients, updateClient, addClient, deleteClient,
    currentUserEmail, globalAlert,
    clientAlerts, addClientAlert, resolveClientAlert, clientDocuments, addClientDocument,
    kpis, updateKpis, agencyTasks, addAgencyTask, updateAgencyTask, deleteAgencyTask,
    clientPayments, addClientPayment, updateClientPayment, deleteClientPayment,
    theme, toggleTheme,
    auditLogs, logAuditEvent,
    systemLicense, updateSystemLicense
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
