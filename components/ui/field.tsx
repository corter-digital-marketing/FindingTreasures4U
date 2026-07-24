import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
};

export function Field({
  label,
  name,
  error,
  required,
  className = "",
  ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] tracking-[0.1em] uppercase text-charcoal-soft">
        {label}
        {required && <span className="text-oxblood"> *</span>}
      </span>
      <input
        name={name}
        required={required}
        aria-invalid={!!error}
        className="mt-2 w-full border-0 border-b border-line bg-transparent py-2 text-[15px] text-charcoal outline-none transition-colors focus:border-bronze-dark"
        {...props}
      />
      {error && <span className="mt-1.5 block text-[12px] text-oxblood">{error}</span>}
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  error,
  required,
  className = "",
  ...props
}: BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof BaseProps> & {
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] tracking-[0.1em] uppercase text-charcoal-soft">
        {label}
        {required && <span className="text-oxblood"> *</span>}
      </span>
      <textarea
        name={name}
        required={required}
        aria-invalid={!!error}
        rows={3}
        className="mt-2 w-full resize-none border-b border-line bg-transparent py-2 text-[15px] text-charcoal outline-none transition-colors focus:border-bronze-dark"
        {...props}
      />
      {error && <span className="mt-1.5 block text-[12px] text-oxblood">{error}</span>}
    </label>
  );
}
