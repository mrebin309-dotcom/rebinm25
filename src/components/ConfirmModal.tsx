import { X, AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: 'text-red-600',
      iconBg: 'from-red-500 to-red-600',
      button: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
      border: 'border-red-200'
    },
    warning: {
      icon: 'text-yellow-600',
      iconBg: 'from-yellow-500 to-yellow-600',
      button: 'from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800',
      border: 'border-yellow-200'
    },
    info: {
      icon: 'text-blue-600',
      iconBg: 'from-blue-500 to-blue-600',
      button: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
      border: 'border-blue-200'
    }
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in border-2 border-slate-200">
        <div className={`relative px-6 py-5 border-b ${style.border} bg-gradient-to-r from-slate-50 to-gray-50`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-gradient-to-br ${style.iconBg} rounded-xl shadow-lg`}>
              <AlertTriangle className={`h-6 w-6 text-white`} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 flex-1">{title}</h3>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="text-slate-700 leading-relaxed">
            {typeof message === 'string' ? (
              <p className="whitespace-pre-line">{message}</p>
            ) : (
              message
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-all duration-200 font-semibold hover:shadow-md"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 bg-gradient-to-r ${style.button} text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
