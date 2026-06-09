import { createContext } from "react";

import type { ApiRequestOptions, RequestLog, Session } from "@/types/api";

export interface WorkbenchContextValue {
  session: Session;
  requests: RequestLog[];
  apiRequest: <T>(options: ApiRequestOptions) => Promise<T>;
  clearSession: () => void;
  clearRequests: () => void;
}

export const WorkbenchContext = createContext<WorkbenchContextValue | null>(null);
