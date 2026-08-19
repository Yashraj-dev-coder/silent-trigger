import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'RESPONDER' | 'USER';
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-info-400 animate-spin" />
          <p className="text-sm text-navy-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole === 'RESPONDER' && profile?.role !== 'RESPONDER' && profile?.role !== 'ADMIN') {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireRole === 'USER' && profile?.role === 'RESPONDER') {
    return <Navigate to="/responder" replace />;
  }

  return <>{children}</>;
}
