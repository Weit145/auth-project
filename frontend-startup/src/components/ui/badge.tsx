import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "blue" | "green" | "red" | "amber";
}

const tones = {
  neutral: "border-white/10 bg-white/[0.07] text-white/55",
  blue: "border-[#7b79ff]/35 bg-[#7064ff]/15 text-[#b8b3ff]",
  green: "border-[#55edb4]/30 bg-[#34d89b]/10 text-[#7ef0c3]",
  red: "border-[#ff6688]/30 bg-[#ff496f]/10 text-[#ff9bad]",
  amber: "border-[#ffc765]/30 bg-[#ffb84d]/10 text-[#ffd58d]",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
