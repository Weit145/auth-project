import type { InputHTMLAttributes, PropsWithChildren, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";

interface FieldProps extends PropsWithChildren {
  label: string;
  error?: string;
  hint?: ReactNode;
  htmlFor?: string;
}

export function Field({ label, error, hint, htmlFor, children }: FieldProps) {
  return (
    <label className="grid gap-1.5" htmlFor={htmlFor}>
      <span className="flex items-center justify-between gap-3 text-xs font-semibold text-[var(--text-muted)]">
        {label}
        {hint}
      </span>
      {children}
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
    </label>
  );
}

interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  label: string;
  name: string;
  error?: string;
  register: UseFormRegisterReturn;
  hint?: ReactNode;
}

export function FormInput({
  label,
  name,
  error,
  register,
  hint,
  ...props
}: FormInputProps) {
  return (
    <Field label={label} htmlFor={name} error={error} hint={hint}>
      <Input id={name} {...register} {...props} />
    </Field>
  );
}
