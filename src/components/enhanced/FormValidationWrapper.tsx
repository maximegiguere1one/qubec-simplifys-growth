import React from 'react';
import { z } from 'zod';
import { validateFormData } from '@/lib/validation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface FormValidationWrapperProps<T> {
  children: React.ReactNode;
  schema: z.ZodSchema<T>;
  onValidSubmit: (data: T) => void;
  onValidationError?: (errors: string[]) => void;
  className?: string;
  enableHoneypot?: boolean;
}

export function FormValidationWrapper<T>({
  children,
  schema,
  onValidSubmit,
  onValidationError,
  className = '',
  enableHoneypot = true
}: FormValidationWrapperProps<T>) {
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Convert form data to appropriate types
    const processedData = Object.entries(data).reduce((acc, [key, value]) => {
      // Handle checkboxes and numbers
      if (typeof value === 'string' && value === 'on') {
        acc[key] = true;
      } else if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
        acc[key] = Number(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    const validation = validateFormData(schema, processedData, enableHoneypot);
    
    if (validation.success && validation.data) {
      setValidationErrors([]);
      onValidSubmit(validation.data);
    } else {
      const errors = validation.errors || ['Validation failed'];
      setValidationErrors(errors);
      onValidationError?.(errors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Honeypot field - hidden from users */}
      {enableHoneypot && (
        <input
          type="text"
          name="honeypot"
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            width: '1px', 
            height: '1px',
            opacity: 0 
          }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
      )}
      
      {children}
    </form>
  );
}