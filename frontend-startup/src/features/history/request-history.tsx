import { ChevronDown, Clock3, FileClock, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatJson } from "@/lib/utils";
import type { HttpMethod } from "@/types/api";
import { useWorkbench } from "@/features/workbench/use-workbench";

export function RequestHistory() {
  const { requests, clearRequests } = useWorkbench();

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6">
        <div>
          <span className="section-kicker">Request log</span>
          <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em]">
            История запросов
          </h2>
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">
            Последние 50 запросов текущей вкладки браузера.
          </p>
        </div>
        <Button
          disabled={!requests.length}
          onClick={clearRequests}
          size="sm"
          variant="outline"
        >
          <Trash2 size={13} />
          Очистить
        </Button>
      </div>

      {!requests.length ? (
        <div className="grid min-h-96 place-items-center p-8 text-center">
          <div>
            <span className="mx-auto grid size-14 place-items-center rounded-full border border-dashed border-white/15 bg-white/[0.04] text-[var(--text-muted)]">
              <FileClock size={18} />
            </span>
            <strong className="mt-4 block text-sm">Запросов пока нет</strong>
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
              Выполните шаг auth-flow или используйте API console.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-2 p-3">
          {requests.map((request) => {
            const success =
              typeof request.status === "number" &&
              request.status >= 200 &&
              request.status < 300;
            return (
              <details
                className="history-item group overflow-hidden rounded-xl border border-white/[0.07] bg-black/15"
                key={request.id}
              >
                <summary className="grid cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-3.5 hover:bg-white/[0.04]">
                  <MethodBadge method={request.method} />
                  <strong className="code-area truncate text-xs">{request.path}</strong>
                  <span className="hidden items-center gap-1.5 text-[10px] text-[var(--text-muted)] sm:flex">
                    <Clock3 size={11} />
                    {Math.round(request.duration)} ms
                  </span>
                  <span className="flex items-center gap-3">
                    <Badge tone={success ? "green" : "red"}>{request.status}</Badge>
                    <ChevronDown
                      className="text-[var(--text-muted)] transition-transform group-open:rotate-180"
                      size={14}
                    />
                  </span>
                </summary>
                <div className="grid gap-px border-t border-white/[0.07] bg-white/[0.07] lg:grid-cols-2">
                  <LogPayload label="Request body" value={request.requestBody} />
                  <LogPayload label="Response" value={request.responseBody} />
                </div>
              </details>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span
      className={cn(
        "code-area inline-flex w-11 justify-center rounded-[5px] px-1.5 py-1 text-[9px] font-bold",
        method === "GET"
          ? "bg-[#34d89b]/10 text-[#7ef0c3]"
          : "bg-[#765cff]/15 text-[#b8b3ff]",
      )}
    >
      {method}
    </span>
  );
}

function LogPayload({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="min-w-0 bg-black/20 p-4">
      <span className="section-kicker">{label}</span>
      <pre className="code-area mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words text-[10px] leading-5 text-[#a9cfc2]">
        {formatJson(value) || "No body"}
      </pre>
    </div>
  );
}
