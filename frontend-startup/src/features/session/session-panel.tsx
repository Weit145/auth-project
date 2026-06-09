import { useMutation } from "@tanstack/react-query";
import {
  Check,
  Clipboard,
  KeyRound,
  LogOut,
  RefreshCw,
  ShieldOff,
  Trash2,
  UserRound,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { decodeJwt } from "@/lib/jwt";
import { formatJson } from "@/lib/utils";
import type { AuthResponse, StatusResponse } from "@/types/api";
import { useWorkbench } from "@/features/workbench/use-workbench";

export function SessionPanel() {
  const { session, apiRequest, clearSession } = useWorkbench();
  const payload = session.accessToken ? decodeJwt(session.accessToken) : null;
  const user = session.user;
  const name = user?.name || payload?.name || "Authorized user";
  const email = user?.email || payload?.email || "—";
  const role = user?.role || payload?.role || "user";
  const userId = user?.id || payload?.sub || "—";

  const refresh = useMutation({
    mutationFn: () =>
      apiRequest<AuthResponse>({ method: "POST", path: "/auth/refresh-token" }),
    onSuccess: () => toast.success("Access token обновлён"),
    onError: (error) => toast.error(error.message),
  });

  const logout = useMutation({
    mutationFn: () =>
      apiRequest<StatusResponse>({
        method: "POST",
        path: "/auth/logout",
        auth: true,
      }),
    onSuccess: () => {
      clearSession();
      toast.success("Сессия завершена");
    },
    onError: (error) => toast.error(error.message),
  });

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(session.accessToken);
      toast.success("Access token скопирован");
    } catch {
      toast.error("Не удалось скопировать token");
    }
  };

  if (!session.accessToken) {
    return (
      <Card className="sticky top-28 overflow-hidden">
        <SessionHeading active={false} />
        <div className="grid min-h-64 place-items-center p-8 text-center">
          <div>
            <motion.span
              animate={{ boxShadow: ["0 0 0 rgba(126,99,255,0)", "0 0 38px rgba(126,99,255,.18)", "0 0 0 rgba(126,99,255,0)"] }}
              className="mx-auto grid size-16 place-items-center rounded-full border border-dashed border-white/15 bg-white/[0.04] text-white/35"
              transition={{ duration: 3, repeat: Infinity }}
            >
              <ShieldOff size={22} />
            </motion.span>
            <strong className="mt-4 block text-sm">Сессия не создана</strong>
            <p className="mt-1.5 text-xs leading-5 text-[var(--text-muted)]">
              Подтвердите email или выполните вход.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="sticky top-28 grid gap-4">
      <Card className="overflow-hidden border-[#745cff]/25 shadow-[0_24px_90px_rgba(0,0,0,.32),0_0_55px_rgba(112,84,255,.08),inset_0_1px_0_rgba(255,255,255,.1)]">
        <div className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-[#694cff]/15 blur-3xl" />
        <SessionHeading active />
        <div className="grid gap-5 p-5">
          <div className="flex items-center gap-3">
            <span className="brand-prism grid size-11 place-items-center rounded-xl text-xs font-bold text-white">
              {initials(name)}
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-sm">{name}</strong>
              <span className="mt-0.5 block truncate text-xs text-[var(--text-muted)]">
                {email}
              </span>
            </div>
            <Badge tone="green">{String(role)}</Badge>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.07] text-xs">
            <Meta label="User ID" value={String(userId)} />
            <Meta
              label="Token expires"
              value={
                payload?.exp
                  ? new Date(payload.exp * 1000).toLocaleString("ru-RU")
                  : "не указано"
              }
            />
          </dl>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-white/45">
              Access token
            </span>
            <Textarea
              className="code-area min-h-24 text-[10px] leading-5 text-[#9be7d0]"
              readOnly
              value={session.accessToken}
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={copyToken} size="sm" variant="outline">
              <Clipboard size={13} />
              Копировать
            </Button>
            <Button
              onClick={() => {
                clearSession();
                toast.info("Локальная сессия очищена");
              }}
              size="sm"
              variant="ghost"
            >
              <Trash2 size={13} />
              Очистить
            </Button>
          </div>
        </div>
      </Card>

      <Card className="grid gap-2 p-3">
        <Button
          disabled={refresh.isPending}
          onClick={() => refresh.mutate()}
          variant="outline"
        >
          <RefreshCw className={refresh.isPending ? "animate-spin" : ""} size={15} />
          Обновить access token
        </Button>
        <Button
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
          variant="danger"
        >
          <LogOut size={15} />
          Завершить сессию
        </Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.07] p-4">
          <div>
            <span className="section-kicker">Decoded JWT</span>
            <h3 className="mt-1 text-sm font-semibold">Payload</h3>
          </div>
          <KeyRound className="text-[var(--text-muted)]" size={16} />
        </div>
        <pre className="code-area max-h-72 overflow-auto whitespace-pre-wrap p-4 text-[10px] leading-5 text-[#a9cfc2]">
          {payload ? formatJson(payload) : "Не удалось декодировать payload."}
        </pre>
      </Card>
    </div>
  );
}

function SessionHeading({ active }: { active: boolean }) {
  return (
    <div className="flex items-start justify-between border-b border-white/[0.07] p-5">
      <div>
        <span className="section-kicker">Current session</span>
        <h2 className="mt-1.5 text-base font-semibold">Активная сессия</h2>
      </div>
      <span
        className={`grid size-9 place-items-center rounded-full border ${
          active
            ? "border-[#55edb4]/25 bg-[#34d89b]/10 text-[#7ef0c3] shadow-[0_0_24px_rgba(52,216,155,.12)]"
            : "border-white/10 bg-white/[0.04] text-white/30"
        }`}
      >
        {active ? <Check size={15} /> : <UserRound size={15} />}
      </span>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[95px_1fr] gap-3 bg-black/20 px-3 py-2.5">
      <dt className="text-white/35">{label}</dt>
      <dd className="code-area truncate text-right text-[10px] text-white/65">{value}</dd>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
