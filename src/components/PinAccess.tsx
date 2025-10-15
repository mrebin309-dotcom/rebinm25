import { useState, useEffect } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PinAccessProps {
  onSuccess: () => void;
}

export function PinAccess({ onSuccess }: PinAccessProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [correctPin, setCorrectPin] = useState('2059494');

  useEffect(() => {
    const loadPin = async () => {
      try {
        const { data, error } = await supabase
          .from('pin_settings')
          .select('pin')
          .maybeSingle();

        if (data && !error) {
          setCorrectPin(data.pin);
        }
      } catch (err) {
        console.error('Error loading PIN:', err);
      }
    };
    loadPin();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (pin === correctPin) {
        sessionStorage.setItem('pin-verified', 'true');
        onSuccess();
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-lg mb-4">
            <Lock className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Inventory Management
          </h2>
          <p className="text-slate-600">Enter PIN to access the system</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="pin" className="block text-sm font-semibold text-slate-700 mb-2">
              PIN Code
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center text-2xl tracking-wider font-mono"
              placeholder="••••"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || pin.length < 4}
            className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Verifying...' : 'Access System'}
          </button>
        </form>

      </div>
    </div>
  );
}
