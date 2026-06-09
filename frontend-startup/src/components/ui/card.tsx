import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-panel rounded-[24px] border border-white/10 bg-white/[0.055] text-white shadow-[0_24px_80px_rgba(0,0,0,.24),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl",
        className,
      )}
      {...props}
    />
  );
}
