import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl border text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070611] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "border-white/15 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-xl hover:border-white/30 hover:bg-white/15 hover:shadow-[0_0_30px_rgba(118,106,255,.16)]",
        accent:
          "border-[#9b8cff]/60 bg-[linear-gradient(135deg,#705cff,#9c54ff_55%,#ff5ebc)] text-white shadow-[0_10px_30px_rgba(112,92,255,.35),inset_0_1px_0_rgba(255,255,255,.35)] hover:-translate-y-0.5 hover:shadow-[0_14px_42px_rgba(140,83,255,.48),0_0_24px_rgba(93,214,255,.18)]",
        outline:
          "border-white/15 bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-xl hover:border-[#8e7dff]/45 hover:bg-white/10 hover:shadow-[0_0_25px_rgba(112,92,255,.15)]",
        ghost:
          "border-transparent bg-transparent text-[var(--text-muted)] hover:bg-white/[0.07] hover:text-white",
        danger:
          "border-[#ff6688]/25 bg-[#ff496f]/10 text-[#ff9bad] hover:border-[#ff6688]/45 hover:bg-[#ff496f]/15 hover:shadow-[0_0_28px_rgba(255,73,111,.15)]",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-xs",
        icon: "size-10 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
