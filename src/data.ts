import { Activity, Document, Expense, Feedback, Itinerary, LocalTip, User } from './types';

export const MOCK_USER_CLIENT: User = {
  id: 'u1',
  name: 'João Silva',
  email: 'joao@example.com',
  role: 'CLIENT',
  avatarUrl: 'https://i.pravatar.cc/150?u=joao',
};

export const MOCK_USER_ADMIN: User = {
  id: 'u2',
  name: 'Admin Agência',
  email: 'admin@agencia.com',
  role: 'ADMIN',
};

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    title: 'Voo de Ida - GOL G3 1234',
    time: '08:00',
    date: '2024-10-15',
    location: 'Aeroporto de Guarulhos (GRU)',
    description: 'Apresentação com 2 horas de antecedência. Terminal 2.',
    isCompleted: true,
    mapLink: 'https://maps.google.com/?q=Aeroporto+de+Guarulhos',
  },
  {
    id: 'a2',
    title: 'Check-in Hotel Plaza',
    time: '14:00',
    date: '2024-10-15',
    location: 'Hotel Plaza Centro',
    description: 'Apresentar voucher e documento na recepção.',
    isCompleted: false,
    mapLink: 'https://maps.google.com/?q=Hotel+Plaza',
  },
  {
    id: 'a3',
    title: 'Tour Guiado Centro Histórico',
    time: '09:00',
    date: '2024-10-16',
    location: 'Praça da Matriz',
    description: 'Encontro com o guia local (Carlos). Levar água e protetor solar.',
    isCompleted: false,
    mapLink: 'https://maps.google.com/?q=Praça+da+Matriz',
  },
  {
    id: 'a4',
    title: 'Jantar Restaurante Vista',
    time: '20:00',
    date: '2024-10-16',
    location: 'Restaurante Vista',
    description: 'Reserva em nome de João Silva.',
    isCompleted: false,
    mapLink: 'https://maps.google.com/?q=Restaurante+Vista',
  },
];

export const MOCK_ITINERARY: Itinerary = {
  id: 'it1',
  clientId: 'u1',
  clientName: 'João Silva',
  title: 'Férias em Paris',
  startDate: '2024-10-15',
  endDate: '2024-10-22',
  destination: 'Paris, França',
  activities: MOCK_ACTIVITIES,
};

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc1',
    title: 'Passagem Aérea - Ida',
    type: 'PDF',
    url: '#',
    isOfflineAvailable: true,
  },
  {
    id: 'doc2',
    title: 'Voucher Hotel Plaza',
    type: 'PDF',
    url: '#',
    isOfflineAvailable: true,
  },
  {
    id: 'doc3',
    title: 'Seguro Viagem Apólice',
    type: 'PDF',
    url: '#',
    isOfflineAvailable: false,
  },
];

export const MOCK_TIPS: LocalTip[] = [
  {
    id: 'tip1',
    title: 'Café de la Paix',
    description: 'Melhor croissant da região! Ideal para o café da manhã antes do Louvre.',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400',
    category: 'RESTAURANT',
  },
  {
    id: 'tip2',
    title: 'Vista da Torre (Alternativa)',
    description: 'Vá ao terraço da Galeries Lafayette para uma vista incrível e gratuita da cidade.',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400',
    category: 'SIGHTSEEING',
  },
];

export const MOCK_FEEDBACKS: Feedback[] = [
  {
    id: 'fb1',
    clientId: 'u3',
    clientName: 'Maria Souza',
    itineraryId: 'it_old_1',
    rating: 5,
    comment: 'Viagem perfeita! Tudo muito bem organizado pela agência.',
    date: '2024-09-20',
  },
  {
    id: 'fb2',
    clientId: 'u4',
    clientName: 'Carlos Mendes',
    itineraryId: 'it_old_2',
    rating: 4,
    comment: 'O hotel era ótimo, mas o voo atrasou bastante. No geral, boa experiência.',
    date: '2024-09-22',
  },
];

