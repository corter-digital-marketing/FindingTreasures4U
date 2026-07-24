import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[13px] font-medium uppercase tracking-[0.14em] transition-all duration-300 ease-out disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-oxblood text-ivory px-7 py-3.5 hover:bg-oxblood-dark shadow-[0_1px_0_rgba(0,0,0,0.05)]",
  secondary:
    "border border-charcoal/70 text-charcoal px-7 py-3.5 hover:bg-charcoal hover:text-ivory hover:border-charcoal",
  ghost: "text-charcoal px-0 py-1 hover:text-bronze-dark",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ className = "", variant = "primary", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
});
Button.displayName = "Button";
