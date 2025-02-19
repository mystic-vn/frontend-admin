import { ReactNode } from 'react';
import { FormControl, FormDescription, FormField as FormFieldUI, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  children: ReactNode | ((field: ControllerRenderProps<FieldValues, string>) => ReactNode);
}

export function FormField({ name, label, description, children }: FormFieldProps) {
  const form = useFormContext();

  return (
    <FormFieldUI
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            {typeof children === 'function' 
              ? (children as (field: ControllerRenderProps<FieldValues, string>) => ReactNode)(field)
              : children
            }
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 