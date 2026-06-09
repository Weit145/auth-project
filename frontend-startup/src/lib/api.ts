import type { ApiRequestOptions, HttpMethod, RequestLog } from "@/types/api";

const API_BASE = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | "NET",
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestApiOptions extends ApiRequestOptions {
  accessToken: string;
  onLog: (entry: RequestLog) => void;
}

export async function requestApi<T>({
  method = "GET",
  path,
  body,
  auth = false,
  signal,
  accessToken,
  onLog,
}: RequestApiOptions): Promise<T> {
  const startedAt = performance.now();
  const headers: HeadersInit = { Accept: "application/json" };
  const requestBody =
    body === undefined || body === null || body === ""
      ? undefined
      : typeof body === "string"
        ? body
        : JSON.stringify(body);

  if (requestBody) headers["Content-Type"] = "application/json";
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let status: number | "NET" = "NET";
  let responseBody: unknown;

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: requestBody,
      credentials: "include",
      signal,
    });
    status = response.status;
    const text = await response.text();

    try {
      responseBody = text ? JSON.parse(text) : null;
    } catch {
      responseBody = text;
    }

    onLog(createLog(method, path, status, requestBody, responseBody, startedAt));

    if (!response.ok) {
      const responseRecord =
        typeof responseBody === "object" && responseBody !== null
          ? (responseBody as Record<string, unknown>)
          : undefined;
      const message =
        responseRecord?.error ?? responseRecord?.status ?? `HTTP ${status}`;
      throw new ApiError(String(message), status, responseBody);
    }

    return responseBody as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw error;

    const message = error instanceof Error ? error.message : "Network error";
    onLog(createLog(method, path, "NET", requestBody, message, startedAt));
    throw new ApiError(message, "NET");
  }
}

function createLog(
  method: HttpMethod,
  path: string,
  status: number | "NET",
  requestBody: string | undefined,
  responseBody: unknown,
  startedAt: number,
): RequestLog {
  return {
    id: crypto.randomUUID(),
    method,
    path,
    status,
    requestBody,
    responseBody,
    duration: performance.now() - startedAt,
    time: new Date(),
  };
}
