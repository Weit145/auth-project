import { Activity, Command, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <motion.header
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 text-white sm:px-5"
      initial={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="header-glass mx-auto flex min-h-16 w-[min(100%,1380px)] items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-[#0d0b1a]/55 px-3 shadow-[0_14px_50px_rgba(0,0,0,.25),inset_0_1px_0_rgba(255,255,255,.1)] backdrop-blur-2xl sm:px-4">
        <a className="flex items-center gap-3" href="/" aria-label="KLoad Auth Desk">
          <span className="brand-prism grid size-10 place-items-center rounded-xl text-white">
            <ShieldCheck size={19} strokeWidth={2.2} />
          </span>
          <span>
            <strong className="block text-sm tracking-[-0.02em]">KLoad / Auth</strong>
            <span className="mt-0.5 hidden text-[9px] font-bold uppercase tracking-[0.16em] text-white/35 sm:block">
              identity control plane
            </span>
          </span>
        </a>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-[#65edbe]/15 bg-[#4ce3ad]/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#87f4cc] md:flex">
            <span className="status-pulse"><Activity size={11} /></span>
            systems linked
          </span>
          <span className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[10px] font-semibold text-white/40 lg:flex">
            <Command size={12} />
            K
          </span>
          <Button
            asChild
            className="border-white/10 bg-white/[0.06] text-white"
            size="sm"
            variant="outline"
          >
            <a href="/swagger/index.html" rel="noreferrer" target="_blank">
              <Sparkles size={13} />
              <span className="hidden sm:inline">Swagger</span>
              <ExternalLink size={13} />
            </a>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
