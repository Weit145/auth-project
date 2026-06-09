import { ArrowRight, Braces, Check, Play, Route, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { endpointPresets } from "@/data/endpoints";
import { cn } from "@/lib/utils";
import type { EndpointPreset, HttpMethod, StatusResponse } from "@/types/api";
import { useWorkbench } from "@/features/workbench/use-workbench";

interface ApiConsoleProps {
  onRequestComplete: () => void;
}

export function ApiConsole({ onRequestComplete }: ApiConsoleProps) {
  const { apiRequest, session } = useWorkbench();
  const [method, setMethod] = useState<HttpMethod>("POST");
  const [path, setPath] = useState("/auth/login");
  const [body, setBody] = useState(
    '{\n  "email": "",\n  "password": "Test12345"\n}',
  );
  const [auth, setAuth] = useState(false);
  const [pending, setPending] = useState(false);

  const selectPreset = (preset: EndpointPreset) => {
    setMethod(preset.method);
    setPath(preset.path);
    setBody(preset.body ?? "");
    setAuth(Boolean(preset.auth));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    let parsedBody: unknown;

    try {
      parsedBody = body.trim() ? JSON.parse(body) : undefined;
    } catch {
      toast.error("JSON body содержит синтаксическую ошибку");
      return;
    }

    setPending(true);
    try {
      const response = await apiRequest<StatusResponse>({
        method,
        path: path.trim(),
        body: parsedBody,
        auth,
      });
      toast.success(`Получен ответ: ${response?.status ?? "success"}`);
      onRequestComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Неизвестная ошибка");
      onRequestComplete();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="overflow-hidden">
        <div className="border-b border-white/[0.07] p-5 sm:p-6">
          <span className="section-kicker">Request builder</span>
          <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em]">
            Ручной HTTP-запрос
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-[var(--text-muted)]">
            Отправка идёт через тот же `/api` proxy, что и основной auth-flow.
          </p>
        </div>

        <form className="grid gap-5 p-5 sm:p-6" onSubmit={submit}>
          <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)_auto]">
            <label className="sr-only" htmlFor="console-method">
              HTTP method
            </label>
            <select
              className="control"
              id="console-method"
              onChange={(event) => setMethod(event.target.value as HttpMethod)}
              value={method}
            >
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="console-path">
              Endpoint path
            </label>
            <Input
              id="console-path"
              onChange={(event) => setPath(event.target.value)}
              value={path}
            />
            <Button disabled={pending} type="submit" variant="accent">
              <Play className={pending ? "animate-pulse" : ""} size={14} />
              Отправить
            </Button>
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <input
              checked={auth}
              className="size-4 accent-[var(--signal)]"
              onChange={(event) => setAuth(event.target.checked)}
              type="checkbox"
            />
            <ShieldCheck size={14} />
            Добавить Bearer access token
            {!session.accessToken && auth && <Badge tone="amber">token пуст</Badge>}
          </label>

          <label className="grid gap-1.5">
            <span className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
              <Braces size={13} />
              JSON body
            </span>
            <Textarea
              className="code-area min-h-80 text-xs leading-6"
              onChange={(event) => setBody(event.target.value)}
              spellCheck={false}
              value={body}
            />
          </label>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-white/[0.07] p-5">
          <span className="section-kicker">Available routes</span>
          <h2 className="mt-1.5 text-base font-semibold">Gateway endpoints</h2>
        </div>
        <div className="grid gap-2 p-3">
          {endpointPresets.map((preset) => {
            const selected = path === preset.path && method === preset.method;
            return (
              <button
                className={cn(
                  "group grid grid-cols-[42px_1fr_auto] items-center gap-3 rounded-[9px] border p-3 text-left transition-colors",
                  selected
                    ? "border-[#8f7dff]/35 bg-[#765cff]/10 shadow-[0_0_24px_rgba(112,92,255,.08)]"
                    : "border-white/[0.07] bg-black/15 hover:border-white/15 hover:bg-white/[0.05]",
                )}
                key={`${preset.method}-${preset.path}`}
                onClick={() => selectPreset(preset)}
                type="button"
              >
                <span className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-[var(--text-muted)]">
                  <Route size={14} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <Badge tone={preset.method === "GET" ? "green" : "blue"}>
                      {preset.method}
                    </Badge>
                    <strong className="code-area truncate text-[10px]">{preset.path}</strong>
                  </span>
                  <span className="mt-1.5 block text-xs text-[var(--text-muted)]">
                    {preset.description}
                  </span>
                </span>
                {selected ? (
                  <Check className="text-[var(--signal)]" size={15} />
                ) : (
                  <ArrowRight
                    className="text-[var(--text-soft)] transition-transform group-hover:translate-x-0.5"
                    size={15}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
