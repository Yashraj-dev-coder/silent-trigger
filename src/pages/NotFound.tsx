import { Link } from 'react-router-dom';
import { Home, AlertCircle, Shield } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-navy-800/50">
            <AlertCircle className="h-10 w-10 text-navy-400" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-lg text-navy-200 mb-2">Page not found</p>
        <p className="text-sm text-navy-400 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-info-600 px-6 py-3 text-sm font-semibold text-white hover:bg-info-500 transition-colors"
        >
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}

export function Unauthorized() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emergency-500/10">
            <Shield className="h-10 w-10 text-emergency-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-sm text-navy-300 mb-6">You don't have permission to access this page. This area requires responder or admin privileges.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-navy-700 px-6 py-3 text-sm font-semibold text-navy-100 hover:bg-navy-800 transition-colors"
        >
          <Home className="h-4 w-4" /> Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
