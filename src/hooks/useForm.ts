import { useState, useCallback } from 'react';
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}
interface ValidationRules {
  [key: string]: ValidationRule;
}
interface FormErrors {
  [key: string]: string;
}
export function useForm<T extends Record<string, any>>(initialValues: T, validationRules?: ValidationRules) {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validateField = useCallback((name: string, value: any): string | null => {
    if (!validationRules || !validationRules[name]) return null;
    const rules = validationRules[name];
    if (rules.required && !value) {
      return 'Este campo es requerido';
    }
    if (rules.minLength && value.length < rules.minLength) {
      return `Mínimo ${rules.minLength} caracteres`;
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Máximo ${rules.maxLength} caracteres`;
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Formato inválido';
    }
    if (rules.custom) {
      return rules.custom(value);
    }
    return null;
  }, [validationRules]);
  const validateAll = useCallback((): boolean => {
    if (!validationRules) return true;
    const newErrors: FormErrors = {};
    let isValid = true;
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });
    setErrors(newErrors);
    return isValid;
  }, [values, validationRules, validateField]);
  const handleChange = useCallback((name: string, value: any) => {
    setValuesState(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    }
  }, [touched, validateField]);
  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
  }, [values, validateField]);
  const handleSubmit = useCallback(async (onSubmit: (values: T) => Promise<void> | void) => {
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {});
    setTouched(allTouched);
    const isValid = validateAll();
    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    setIsSubmitting(false);
  }, [values, validateAll]);
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  const setFieldValue = useCallback((name: string, value: any) => {
    setValuesState(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  const setFieldError = useCallback((name: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);
  const setValues = useCallback((newValues: Partial<T> | T) => {
    setValuesState(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    setValues,
    validateAll
  };
}