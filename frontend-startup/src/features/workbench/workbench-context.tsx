import {
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { WorkbenchContext } from "@/features/workbench/workbench-store";
import { requestApi } from "@/lib/api";
import { emptySession, loadSession, saveSession } from "@/lib/storage";
import type {
  ApiRequestOptions,
  AuthResponse,
  RequestLog,
  Session,
} from "@/types/api";

function isAuthResponse(value: unknown): value is AuthResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Partial<AuthResponse>).access_token === "string"
  );
}

export function WorkbenchProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session>(loadSession);
  const [requests, setRequests] = useState<RequestLog[]>([]);

  const addRequest = useCallback((entry: RequestLog) => {
    setRequests((current) => [entry, ...current].slice(0, 50));
  }, []);

  const apiRequest = useCallback(
    async <T,>(options: ApiRequestOptions) => {
      const response = await requestApi<T>({
        ...options,
        accessToken: session.accessToken,
        onLog: addRequest,
      });

      if (isAuthResponse(response)) {
        const nextSession = {
          accessToken: response.access_token,
          user: response.user ?? session.user,
        };
        setSession(nextSession);
        saveSession(nextSession);
      }

      return response;
    },
    [addRequest, session],
  );

  const clearSession = useCallback(() => {
    setSession(emptySession);
    saveSession(emptySession);
  }, []);

  const clearRequests = useCallback(() => setRequests([]), []);

  const value = useMemo(
    () => ({ session, requests, apiRequest, clearSession, clearRequests }),
    [apiRequest, clearRequests, clearSession, requests, session],
  );

  return (
    <WorkbenchContext.Provider value={value}>
      {children}
    </WorkbenchContext.Provider>
  );
}
