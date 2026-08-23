/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth
import LoginScreen from './components/client/LoginScreen';

// Client Screens
import ClientLayout from './components/client/ClientLayout';
import ItineraryScreen from './components/client/ItineraryScreen';
import VaultScreen from './components/client/VaultScreen';
import BudgetScreen from './components/client/BudgetScreen';
import LuggageChecklistScreen from './components/client/LuggageChecklistScreen';
import LocalTipsScreen from './components/client/LocalTipsScreen';
import PhrasebookScreen from './components/client/PhrasebookScreen';
import DiaryScreen from './components/client/DiaryScreen';
import ClientFeedbackScreen from './components/client/ClientFeedbackScreen';

// Admin Screens
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import CloneItinerary from './components/admin/CloneItinerary';
import CreateItineraryScreen from './components/admin/CreateItineraryScreen';
import FeedbackModule from './components/admin/FeedbackModule';
import ClientCRMScreen from './components/admin/ClientCRMScreen';
import AdminTasksScreen from './components/admin/AdminTasksScreen';
import AdminFinanceScreen from './components/admin/AdminFinanceScreen';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole: 'CLIENT' | 'ADMIN' }) {
  const role = localStorage.getItem('userRole');
  if (role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            
            {/* Client Mobile App Routes */}
            <Route 
              path="/app" 
              element={
                <ProtectedRoute requiredRole="CLIENT">
                  <ErrorBoundary fallbackTitle="Erro na área do passageiro">
                    <ClientLayout />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            >
              <Route path="itinerary" element={<ItineraryScreen />} />
              <Route path="vault" element={<VaultScreen />} />
              <Route path="budget" element={<BudgetScreen />} />
              <Route path="luggage" element={<LuggageChecklistScreen />} />
              <Route path="phrases" element={<PhrasebookScreen />} />
              <Route path="tips" element={<LocalTipsScreen />} />
              <Route path="diary" element={<DiaryScreen />} />
              <Route path="feedback" element={<ClientFeedbackScreen />} />
            </Route>

            {/* Admin Web Dashboard Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <ErrorBoundary fallbackTitle="Erro no painel administrativo">
                    <AdminLayout />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="clone" element={<CloneItinerary />} />
              <Route path="create" element={<CreateItineraryScreen />} />
              <Route path="feedback" element={<FeedbackModule />} />
              <Route path="crm" element={<ClientCRMScreen />} />
              <Route path="finance" element={<AdminFinanceScreen />} />
              <Route path="tasks" element={<AdminTasksScreen />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}


