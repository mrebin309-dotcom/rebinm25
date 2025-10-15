import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import App from './App';

export function AppWrapper() {
  const { user, loading } = useAuth();
  const [authComplete, setAuthComplete] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !authComplete) {
    return <AuthForm onAuthSuccess={() => setAuthComplete(true)} />;
  }

  return <App />;
}

export default AppWrapper;
