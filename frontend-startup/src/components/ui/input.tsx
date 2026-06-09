import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,.04)] outline-none transition-all duration-300 placeholder:text-white/25 hover:border-white/20 focus:border-[#8d7cff]/70 focus:bg-black/30 focus:ring-4 focus:ring-[#7c63ff]/10 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
