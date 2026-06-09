import {
  Activity,
  ArrowDown,
  ArrowUpRight,
  Braces,
  Database,
  Fingerprint,
  FlaskConical,
  History,
  KeyRound,
  LockKeyhole,
  Network,
  Orbit,
  RadioTower,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  UserRoundCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useState } from "react";

import { AmbientScene } from "@/components/layout/ambient-scene";
import { AppHeader } from "@/components/layout/app-header";
import { PointerGlow } from "@/components/layout/pointer-glow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthFlow } from "@/features/auth/auth-flow";
import { HealthOverview } from "@/features/health/health-overview";
import { SessionPanel } from "@/features/session/session-panel";
import { useWorkbench } from "@/features/workbench/use-workbench";
import { cn } from "@/lib/utils";

type View = "flow" | "console" | "history";

const ApiConsole = lazy(() =>
  import("@/features/console/api-console").then((module) => ({
    default: module.ApiConsole,
  })),
);
const RequestHistory = lazy(() =>
  import("@/features/history/request-history").then((module) => ({
    default: module.RequestHistory,
  })),
);

const views = [
  { id: "flow", label: "Auth flow", meta: "5 шагов", icon: FlaskConical },
  { id: "console", label: "API console", meta: "ручной запрос", icon: TerminalSquare },
  { id: "history", label: "История", meta: "request log", icon: History },
] satisfies Array<{ id: View; label: string; meta: string; icon: typeof Activity }>;

export function App() {
  const [view, setView] = useState<View>("flow");
  const { requests, session } = useWorkbench();

  return (
    <div className="min-h-screen">
      <AmbientScene />
      <PointerGlow />
      <AppHeader />

      <main className="mx-auto w-[min(100%-24px,1380px)] pb-20 pt-24 sm:w-[min(100%-40px,1380px)] sm:pt-28">
        <section className="relative grid min-h-[calc(100vh-8rem)] items-center gap-8 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,.95fr)]">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 36 }}
            transition={{ delay: 0.12, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="hero-chip"><i /> live identity infrastructure</span>
              <span className="hero-chip"><Sparkles size={11} /> liquid interface</span>
            </div>

            <h1 className="hero-title mt-8 max-w-4xl text-[clamp(3.2rem,8.2vw,7.6rem)]">
              Auth flow,
              <span className="gradient-text block">видимый насквозь.</span>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
              Живой центр управления авторизацией: создавайте пользователей,
              отслеживайте путь токена и наблюдайте состояние каждого узла системы
              в реальном времени.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                className="h-12 px-5"
                onClick={() => document.getElementById("workspace")?.scrollIntoView()}
                variant="accent"
              >
                Запустить auth-flow
                <ArrowDown size={15} />
              </Button>
              <Button asChild className="h-12 px-5" variant="outline">
                <a href="/swagger/index.html" rel="noreferrer" target="_blank">
                  Исследовать API
                  <ArrowUpRight size={15} />
                </a>
              </Button>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-2">
              <HeroMetric label="Gateway routes" value="06" />
              <HeroMetric label="Auth steps" value="05" />
              <HeroMetric label="Session" value={session.accessToken ? "LIVE" : "IDLE"} />
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="relative"
            initial={{ opacity: 0, scale: 0.88, rotate: 4 }}
            transition={{ delay: 0.25, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <SecurityCore />
          </motion.div>

          <motion.div
            animate={{ opacity: 1 }}
            className="absolute bottom-2 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/25 lg:flex"
            initial={{ opacity: 0 }}
            transition={{ delay: 1.3 }}
          >
            <span className="h-px w-8 bg-white/15" />
            scroll to control plane
            <span className="h-px w-8 bg-white/15" />
          </motion.div>
        </section>

        <motion.section
          id="workspace"
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          viewport={{ amount: 0.15, once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_1.15fr]">
            <WorkspaceIntro />
            <HealthOverview />
          </div>

          <div className="sticky top-24 z-40 mb-5 flex flex-col justify-between gap-3 rounded-[20px] border border-white/10 bg-[#0c0918]/65 p-2 shadow-[0_18px_60px_rgba(0,0,0,.28),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl sm:flex-row sm:items-center">
            <nav aria-label="Разделы Auth Desk" className="flex gap-1 overflow-x-auto">
              {views.map((item) => {
                const Icon = item.icon;
                const count = item.id === "history" ? requests.length : null;
                const active = view === item.id;
                return (
                  <button
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex shrink-0 items-center gap-2.5 rounded-[14px] px-4 py-3 text-xs font-semibold transition-colors",
                      active ? "text-white" : "text-white/40 hover:text-white/75",
                    )}
                    key={item.id}
                    onClick={() => setView(item.id)}
                    type="button"
                  >
                    {active && (
                      <motion.span
                        className="absolute inset-0 rounded-[14px] border border-white/10 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_0_28px_rgba(120,92,255,.12)]"
                        layoutId="active-view"
                        transition={{ type: "spring", bounce: 0.18, duration: 0.55 }}
                      />
                    )}
                    <Icon className="relative" size={14} />
                    <span className="relative">{item.label}</span>
                    <span className="relative text-[8px] uppercase tracking-[0.1em] text-white/25">
                      {count ?? item.meta}
                    </span>
                  </button>
                );
              })}
            </nav>
            <span className="hidden items-center gap-2 px-3 text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 md:flex">
              <RadioTower size={12} />
              one origin / secure cookie
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              key={view}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              {view === "flow" && (
                <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
                  <AuthFlow />
                  <SessionPanel />
                </section>
              )}
              {view === "console" && (
                <Suspense fallback={<ViewLoader />}>
                  <ApiConsole onRequestComplete={() => setView("history")} />
                </Suspense>
              )}
              {view === "history" && (
                <Suspense fallback={<ViewLoader />}>
                  <RequestHistory />
                </Suspense>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.section>
      </main>
    </div>
  );
}

function ViewLoader() {
  return (
    <div className="glass-panel grid min-h-96 place-items-center rounded-[24px] border border-white/10 bg-white/[0.045]">
      <div className="text-center">
        <motion.span
          animate={{ rotate: 360 }}
          className="brand-prism mx-auto grid size-12 place-items-center rounded-xl"
          transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
        >
          <Orbit size={18} />
        </motion.span>
        <span className="section-kicker mt-5">Loading module</span>
      </div>
    </div>
  );
}

function SecurityCore() {
  return (
    <div className="glass-panel overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.045] p-3 shadow-[0_40px_140px_rgba(0,0,0,.38),0_0_100px_rgba(100,74,255,.08),inset_0_1px_0_rgba(255,255,255,.1)] backdrop-blur-2xl sm:p-5">
      <div className="flex items-center justify-between px-2 py-1">
        <div>
          <span className="section-kicker">Identity network</span>
          <strong className="mt-1 block text-sm">Secure route visualization</strong>
        </div>
        <Badge tone="green">encrypted</Badge>
      </div>
      <div className="orbit-stage">
        <div className="orbit-node"><Fingerprint size={12} /> Client</div>
        <div className="orbit-node"><Network size={12} /> Gateway</div>
        <div className="orbit-node"><Database size={12} /> Postgres</div>
        <div className="orbit-node"><KeyRound size={12} /> JWT</div>
        <motion.div
          animate={{ rotate: [0, 6, -4, 0], scale: [1, 1.04, 0.98, 1] }}
          className="core-sphere"
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        >
          <ShieldCheck size={34} strokeWidth={1.5} />
        </motion.div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <CoreStat icon={LockKeyhole} label="Transport" value="TLS" />
        <CoreStat icon={Braces} label="Protocol" value="gRPC" />
        <CoreStat icon={Orbit} label="State" value="LIVE" />
      </div>
    </div>
  );
}

function CoreStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/15 px-3 py-2.5">
      <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white/25">
        <Icon size={10} /> {label}
      </span>
      <strong className="mt-1 block text-[10px] tracking-[0.08em] text-white/70">{value}</strong>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-white/10 pl-3">
      <strong className="gradient-text block text-lg font-semibold tracking-[-0.04em]">{value}</strong>
      <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.13em] text-white/25">{label}</span>
    </div>
  );
}

function WorkspaceIntro() {
  return (
    <div className="glass-panel rounded-[24px] border border-white/10 bg-white/[0.045] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl">
      <div className="flex items-start gap-4">
        <span className="brand-prism grid size-11 shrink-0 place-items-center rounded-xl">
          <UserRoundCheck size={19} />
        </span>
        <div>
          <span className="section-kicker">Control plane / 01</span>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Управляйте всем циклом сессии
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-6 text-white/40">
            Каждый запрос проходит через реальный gateway, появляется в журнале и
            обновляет визуальное состояние активной сессии.
          </p>
        </div>
      </div>
    </div>
  );
}
