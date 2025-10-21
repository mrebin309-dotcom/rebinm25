import { useState } from 'react';
import { Shield, KeyRound, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';
import QRCode from 'react-qr-code';

interface TwoFactorAuthProps {
  onClose: () => void;
}

export function TwoFactorAuth({ onClose }: TwoFactorAuthProps) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSecret = async () => {
    setLoading(true);
    try {
      const secret = generateRandomSecret();
      setSecret(secret);

      const otpauth = `otpauth://totp/InventoryApp:${user?.email}?secret=${secret}&issuer=InventoryApp`;
      setQrCode(otpauth);
      setStep('verify');
    } catch (err) {
      error('Failed to generate 2FA secret');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const isValid = verifyTOTP(secret, verificationCode);

      if (!isValid) {
        error('Invalid verification code. Please try again.');
        return;
      }

      await supabase.from('two_factor_auth').upsert({
        user_id: user?.id,
        secret: secret,
        enabled: true,
        backup_codes: generateBackupCodes(),
      });

      success('Two-factor authentication enabled successfully!');
      onClose();
    } catch (err) {
      error('Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomSecret = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  };

  const generateBackupCodes = (): string[] => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const verifyTOTP = (secret: string, token: string): boolean => {
    const time = Math.floor(Date.now() / 1000 / 30);
    const expectedToken = generateTOTP(secret, time);
    return token === expectedToken;
  };

  const generateTOTP = (secret: string, time: number): string => {
    const code = ((time % 1000000) + parseInt(secret.slice(-6), 36)) % 1000000;
    return code.toString().padStart(6, '0');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Two-Factor Authentication
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Add an extra layer of security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {step === 'setup' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Two-factor authentication adds an extra layer of security to your account by requiring
                a code from your phone in addition to your password.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">Setup Instructions:</h3>
              <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">1.</span>
                  Install an authenticator app (Google Authenticator, Authy, etc.)
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">2.</span>
                  Click the button below to generate your QR code
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">3.</span>
                  Scan the QR code with your authenticator app
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">4.</span>
                  Enter the verification code from your app
                </li>
              </ol>
            </div>

            <button
              onClick={generateSecret}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <KeyRound className="h-5 w-5" />
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700">
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-xl">
                  <QRCode value={qrCode} size={200} />
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Manual Entry Code:
                </p>
                <p className="text-sm font-mono text-slate-900 dark:text-white break-all">
                  {secret}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-center text-2xl font-mono tracking-widest text-slate-900 dark:text-white"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep('setup');
                  setVerificationCode('');
                }}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 font-semibold"
              >
                Back
              </button>
              <button
                onClick={verifyAndEnable}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-5 w-5" />
                {loading ? 'Verifying...' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
