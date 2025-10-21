import { ReactNode } from 'react';

interface MobileInputProps {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  type?: 'text' | 'number' | 'select' | 'date';
  placeholder?: string;
  options?: { value: string; label: string }[];
  icon?: ReactNode;
  required?: boolean;
  min?: number;
  step?: number;
}

export function MobileInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  options,
  icon,
  required,
  min,
  step,
}: MobileInputProps) {
  const inputClasses = "w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 px-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {type === 'select' ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClasses} ${icon ? 'pl-12' : ''} appearance-none cursor-pointer`}
            required={required}
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            placeholder={placeholder}
            className={`${inputClasses} ${icon ? 'pl-12' : ''}`}
            required={required}
            min={min}
            step={step}
            inputMode={type === 'number' ? 'decimal' : undefined}
          />
        )}
      </div>
    </div>
  );
}
