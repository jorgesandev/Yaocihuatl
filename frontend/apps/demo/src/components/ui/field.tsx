import type { ReactNode } from "react";

interface FieldProps {
  id: string;
  label: string;
  helper?: string;
  children: ReactNode;
}

export function Field({ id, label, helper, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
      </label>
      {children}
      {helper ? (
        <p className="text-sm leading-6 text-neutral-600" id={`${id}-helper`}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}
