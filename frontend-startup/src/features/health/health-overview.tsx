import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  Server,
  Signal,
  Waves,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { HealthResponse } from "@/types/api";
import { useWorkbench } from "@/features/workbench/use-workbench";

export function HealthOverview() {
  const { apiRequest } = useWorkbench();
  const health = useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) =>
      apiRequest<HealthResponse>({ path: "/_health", signal }),
    refetchInterval: 30_000,
  });

  const services = health.data?.services ?? [];

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-5 border-b border-white/[0.08] p-5">
        <div>
          <span className="section-kicker">Live topology</span>
          <h2 className="mt-1.5 text-base font-semibold tracking-[-0.02em]">
            Пульс системы
          </h2>
        </div>
        <Button
          aria-label="Обновить состояние сервисов"
          className="border-white/10 bg-white/[0.05] text-white"
          disabled={health.isFetching}
          onClick={() => void health.refetch()}
          size="icon"
          variant="outline"
        >
          <RefreshCw className={cn(health.isFetching && "animate-spin")} size={15} />
        </Button>
      </div>

      <div className="grid gap-2 p-2 sm:grid-cols-2">
        {health.isLoading &&
          ["gateway", "auth + db"].map((name) => (
            <ServiceState key={name} loading name={name} />
          ))}

        {health.isError && (
          <ServiceState error message="нет соединения" name="gateway" />
        )}

        {services.map((service) => {
          const ok =
            service.status === "success" && (!service.db || service.db === "success");
          return (
            <ServiceState
              error={!ok}
              key={service.name}
              message={ok ? "работает" : `ошибка${service.db ? ` · db: ${service.db}` : ""}`}
              name={service.db ? `${service.name} + db` : service.name}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] px-5 py-3 text-[9px] font-bold uppercase tracking-[0.13em] text-white/25">
        <span className="flex items-center gap-2"><Waves size={11} /> polling / 30 sec.</span>
        <span>
          {health.dataUpdatedAt
            ? new Date(health.dataUpdatedAt).toLocaleTimeString("ru-RU")
            : "ожидание"}
        </span>
      </div>
    </Card>
  );
}

function ServiceState({
  name,
  message,
  error = false,
  loading = false,
}: {
  name: string;
  message?: string;
  error?: boolean;
  loading?: boolean;
}) {
  const Icon = loading ? LoaderCircle : error ? XCircle : CheckCircle2;
  return (
    <motion.div
      className="relative flex items-center gap-3 overflow-hidden rounded-[16px] border border-white/[0.07] bg-black/15 p-4"
      initial={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45 }}
      whileInView={{ opacity: 1, scale: 1 }}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-px",
          loading && "bg-white/20",
          error && "bg-[#ff6688]",
          !loading && !error && "bg-[#55edb4]",
        )}
      />
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,.08)]",
          loading && "border-white/10 bg-white/[0.05] text-white/40",
          error && "border-[#ff6688]/25 bg-[#ff496f]/10 text-[#ff9bad]",
          !loading && !error && "border-[#55edb4]/20 bg-[#34d89b]/10 text-[#7ef0c3]",
        )}
      >
        <Icon className={cn(loading && "animate-spin")} size={16} />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Server className="text-white/25" size={11} />
          <span className="truncate text-[9px] font-bold uppercase tracking-[0.13em] text-white/35">
            {name}
          </span>
        </div>
        <strong className="mt-1 block text-xs font-semibold text-white/80">
          {loading ? "проверка..." : message}
        </strong>
      </div>
      <Badge
        className="ml-auto"
        tone={loading ? "neutral" : error ? "red" : "green"}
      >
        {loading ? "wait" : error ? "down" : "ok"}
      </Badge>
      {!loading && !error && (
        <Signal className="absolute -right-2 -bottom-3 text-[#65e5b6]/[0.06]" size={70} />
      )}
    </motion.div>
  );
}
