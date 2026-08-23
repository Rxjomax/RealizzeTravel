export type UserRole = 'CLIENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string; 
  password?: string;
  lastTrip?: string;
  nextTrip?: string;
  tripStatus?: 'Em Planejamento' | 'Em Andamento' | 'Finalizada' | 'Nenhuma';
  preferences?: {
    seat?: string;
    diet?: string;
    hotel?: string;
    interests?: string[];
  };
  notes?: string;
}

export interface Activity {
  id: string;
  title: string;
  time: string;
  date: string;
  location: string;
  description: string;
  isCompleted: boolean;
  mapLink: string;
}

export interface Itinerary {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  title: string;
  startDate: string;
  endDate: string;
  destination: string;
  activities: Activity[];
}

export interface Document {
  id: string;
  title: string;
  type: 'PDF' | 'IMAGE';
  url: string;
  isOfflineAvailable: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
}

export interface LocalTip {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'RESTAURANT' | 'SIGHTSEEING' | 'SHOPPING' | 'GENERAL';
}

export interface Feedback {
  id: string;
  clientId: string;
  clientName: string;
  itineraryId: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface AgencyTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface PaymentInstallment {
  id: string;
  number: number;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

export interface ClientPayment {
  id: string;
  clientId: string;
  clientName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  isInstallmentPlan?: boolean;
  installments?: PaymentInstallment[];
}
