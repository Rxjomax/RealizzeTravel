import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Feedback, Itinerary, User, AgencyTask, ClientPayment } from '../types';
import { MOCK_ITINERARY, MOCK_FEEDBACKS } from '../data';

interface AppContextType {
  itineraries: Itinerary[];
  addItinerary: (itinerary: Itinerary) => void;
  feedbacks: Feedback[];
  addFeedback: (feedback: Feedback) => void;
  clients: any[]; // Using the mock clients from CRM
  updateClient: (id: string, updates: any) => void;
  addClient: (client: any) => void;
  currentUserEmail: string | null;
  setCurrentUserEmail: (email: string | null) => void;
  globalAlert: string | null;
  setGlobalAlert: (alert: string | null) => void;
  clientAlerts: any[];
  addClientAlert: (alert: any) => void;
  resolveClientAlert: (id: string) => void;
  clientDocuments: any[];
  addClientDocument: (doc: any) => void;
  kpis: any;
  updateKpis: (kpis: any) => void;
  agencyTasks: AgencyTask[];
  addAgencyTask: (task: AgencyTask) => void;
  updateAgencyTask: (id: string, updates: Partial<AgencyTask>) => void;
  clientPayments: ClientPayment[];
  addClientPayment: (payment: ClientPayment) => void;
  updateClientPayment: (id: string, updates: Partial<ClientPayment>) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_CLIENTS = [
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

  // Seed Data Logic (Run once if collections are empty)
  useEffect(() => {
    const seedData = async () => {
      try {
        const clientsSnap = await getDocs(collection(db, 'users'));
        let adminExists = false;
        
        if (clientsSnap.empty) {
          for (const c of INITIAL_CLIENTS) {
            await setDoc(doc(db, 'users', c.id), c, { merge: true });
          }
          adminExists = true;
        } else {
          clientsSnap.forEach(doc => {
            if (doc.data().email === 'admin@agencia.com') adminExists = true;
          });
        }
        
        if (!adminExists) {
          const adminClient = INITIAL_CLIENTS.find(c => c.email === 'admin@agencia.com');
          if (adminClient) {
            await setDoc(doc(db, 'users', adminClient.id), { ...adminClient, password: 'admin' }, { merge: true });
          }
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

    return () => {
      unsubClients();
      unsubTasks();
      unsubPayments();
      unsubIter();
      unsubFeed();
      unsubAlerts();
      unsubDocs();
    };
  }, []);

  const updateKpis = useCallback((newKpis: any) => {
    setKpis((prev: any) => ({ ...prev, ...newKpis }));
  }, []);

  const addItinerary = useCallback(async (itinerary: Itinerary) => {
    setItineraries(prev => {
      const exists = prev.some(i => i.id === itinerary.id);
      return exists ? prev.map(i => i.id === itinerary.id ? itinerary : i) : [itinerary, ...prev];
    });
    try {
      await setDoc(doc(db, 'itineraries', itinerary.id), itinerary);
    } catch (err) {
      console.warn("Aviso ao salvar roteiro no Firestore:", err);
    }
  }, []);

  const addFeedback = useCallback(async (feedback: Feedback) => {
    setFeedbacks(prev => [feedback, ...prev]);
    try {
      await setDoc(doc(db, 'feedbacks', feedback.id), feedback);
    } catch (err) {
      console.warn("Aviso ao salvar feedback no Firestore:", err);
    }
  }, []);

  const addClient = useCallback(async (client: any) => {
    const newId = client.id || `client_${Date.now()}`;
    const newClientObj = { ...client, id: newId };
    setClients(prev => [...prev, newClientObj]);
    try {
      await setDoc(doc(db, 'users', newId), newClientObj);
    } catch (err) {
      console.warn("Aviso ao cadastrar cliente no Firestore:", err);
    }
  }, []);

  const updateClient = useCallback(async (id: string, updates: any) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      await updateDoc(doc(db, 'users', id), updates);
    } catch (err) {
      console.warn("Aviso ao atualizar cliente no Firestore:", err);
    }
  }, []);

  const addClientAlert = useCallback(async (alert: any) => {
    const alertId = alert.id || `sos_${Date.now()}`;
    const newAlertObj = { ...alert, id: alertId };
    setClientAlerts(prev => [newAlertObj, ...prev]);
    try {
      await setDoc(doc(db, 'clientAlerts', alertId), newAlertObj);
    } catch (err) {
      console.warn("Aviso ao registrar alerta SOS no Firestore:", err);
    }
  }, []);

  const resolveClientAlert = useCallback(async (id: string) => {
    setClientAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    try {
      await updateDoc(doc(db, 'clientAlerts', id), { resolved: true });
    } catch (err) {
      console.warn("Aviso ao resolver alerta no Firestore:", err);
    }
  }, []);

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
    } catch (err) {
      console.warn("Aviso ao salvar documento no Firestore:", err);
    }
  }, []);

  const addAgencyTask = useCallback(async (task: AgencyTask) => {
    setAgencyTasks(prev => [task, ...prev]);
    try {
      await setDoc(doc(db, 'agencyTasks', task.id), task);
    } catch (err) {
      console.warn("Aviso ao salvar tarefa no Firestore:", err);
    }
  }, []);

  const updateAgencyTask = useCallback(async (id: string, updates: Partial<AgencyTask>) => {
    setAgencyTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    try {
      await updateDoc(doc(db, 'agencyTasks', id), updates);
    } catch (err) {
      console.warn("Aviso ao atualizar tarefa no Firestore:", err);
    }
  }, []);

  const addClientPayment = useCallback(async (payment: ClientPayment) => {
    setClientPayments(prev => [payment, ...prev]);
    try {
      await setDoc(doc(db, 'clientPayments', payment.id), payment);
    } catch (err) {
      console.warn("Aviso ao registrar pagamento no Firestore:", err);
    }
  }, []);

  const updateClientPayment = useCallback(async (id: string, updates: Partial<ClientPayment>) => {
    setClientPayments(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    try {
      await updateDoc(doc(db, 'clientPayments', id), updates);
    } catch (err) {
      console.warn("Aviso ao atualizar pagamento no Firestore:", err);
    }
  }, []);

  const contextValue = useMemo(() => ({
    itineraries, addItinerary, feedbacks, addFeedback, clients, updateClient, addClient,
    currentUserEmail, setCurrentUserEmail, globalAlert, setGlobalAlert,
    clientAlerts, addClientAlert, resolveClientAlert, clientDocuments, addClientDocument,
    kpis, updateKpis, agencyTasks, addAgencyTask, updateAgencyTask,
    clientPayments, addClientPayment, updateClientPayment,
    theme, toggleTheme
  }), [
    itineraries, addItinerary, feedbacks, addFeedback, clients, updateClient, addClient,
    currentUserEmail, globalAlert,
    clientAlerts, addClientAlert, resolveClientAlert, clientDocuments, addClientDocument,
    kpis, updateKpis, agencyTasks, addAgencyTask, updateAgencyTask,
    clientPayments, addClientPayment, updateClientPayment,
    theme, toggleTheme
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
