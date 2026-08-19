import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { DevicePage } from '@/pages/Device';
import { Contacts } from '@/pages/Contacts';
import { IncidentHistory } from '@/pages/IncidentHistory';
import { IncidentDetail } from '@/pages/IncidentDetail';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import { ResponderDashboard } from '@/pages/ResponderDashboard';
import { ResponderIncidents } from '@/pages/ResponderIncidents';
import { ResponderIncidentDetail } from '@/pages/ResponderIncidentDetail';
import { ResponderUsers, ResponderDevices, ResponderLogs } from '@/pages/ResponderMisc';
import { NotFound, Unauthorized } from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* User routes */}
              <Route path="/dashboard" element={<ProtectedRoute requireRole="USER"><Dashboard /></ProtectedRoute>} />
              <Route path="/device" element={<ProtectedRoute requireRole="USER"><DevicePage /></ProtectedRoute>} />
              <Route path="/contacts" element={<ProtectedRoute requireRole="USER"><Contacts /></ProtectedRoute>} />
              <Route path="/incidents" element={<ProtectedRoute requireRole="USER"><IncidentHistory /></ProtectedRoute>} />
              <Route path="/incidents/:id" element={<ProtectedRoute requireRole="USER"><IncidentDetail /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute requireRole="USER"><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute requireRole="USER"><Settings /></ProtectedRoute>} />

              {/* Responder routes */}
              <Route path="/responder" element={<ProtectedRoute requireRole="RESPONDER"><ResponderDashboard /></ProtectedRoute>} />
              <Route path="/responder/active" element={<ProtectedRoute requireRole="RESPONDER"><ResponderIncidents /></ProtectedRoute>} />
              <Route path="/responder/resolved" element={<ProtectedRoute requireRole="RESPONDER"><ResponderIncidents resolvedOnly /></ProtectedRoute>} />
              <Route path="/responder/incidents/:id" element={<ProtectedRoute requireRole="RESPONDER"><ResponderIncidentDetail /></ProtectedRoute>} />
              <Route path="/responder/users" element={<ProtectedRoute requireRole="RESPONDER"><ResponderUsers /></ProtectedRoute>} />
              <Route path="/responder/devices" element={<ProtectedRoute requireRole="RESPONDER"><ResponderDevices /></ProtectedRoute>} />
              <Route path="/responder/logs" element={<ProtectedRoute requireRole="RESPONDER"><ResponderLogs /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
