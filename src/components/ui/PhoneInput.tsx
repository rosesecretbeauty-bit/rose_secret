import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Componente de input de teléfono con formateo visual automático
 * Formatea números mexicanos mientras el usuario escribe
 * Ejemplo: 7774486398 -> muestra "777 448 6398"
 */
export function PhoneInput({
  value,
  onChange,
  placeholder = '123 456 7890',
  error,
  className = '',
  disabled = false
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Normalizar número mexicano (acepta cualquier formato)
  const normalizePhone = (input: string): string => {
    // Remover todos los caracteres no numéricos
    const digits = input.replace(/\D/g, '');
    
    // Si empieza con 52, removerlo (código de país)
    if (digits.startsWith('52') && digits.length > 10) {
      return digits.substring(2);
    }
    
    // Retornar solo los primeros 10 dígitos
    return digits.slice(0, 10);
  };

  // Formatear para visualización (XXX XXX XXXX)
  const formatForDisplay = (digits: string): string => {
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  // Actualizar display cuando cambia el value externo
  useEffect(() => {
    const normalized = normalizePhone(value || '');
    setDisplayValue(formatForDisplay(normalized));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Normalizar (solo dígitos, máximo 10)
    const normalized = normalizePhone(input);
    
    // Formatear para visualización
    const formatted = formatForDisplay(normalized);
    
    // Actualizar display
    setDisplayValue(formatted);
    
    // Enviar valor normalizado al padre (solo dígitos, sin formato)
    onChange(normalized);
  };

  const handleBlur = () => {
    // Asegurar que el display esté formateado correctamente
    const normalized = normalizePhone(value || '');
    setDisplayValue(formatForDisplay(normalized));
  };

  return (
    <div className="relative">
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={14} // "777 448 6398" = 12 caracteres con espacios
          className={`
            w-full pl-10 pr-4 py-2 border rounded-lg
            focus:ring-2 focus:ring-rose-500 focus:border-rose-500
            transition-all
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${className}
          `}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      {!error && value && value.length === 10 && (
        <p className="text-xs text-gray-500 mt-1">
          Formato: {formatForDisplay(value)}
        </p>
      )}
    </div>
  );
}

