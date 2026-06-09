export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface StatusResponse {
  status: string;
  error?: string;
}

export interface HealthService {
  name: string;
  status: string;
  db?: string;
}

export interface HealthResponse {
  services: HealthService[];
}

export interface Session {
  accessToken: string;
  user: User | null;
}

export interface ApiRequestOptions {
  method?: HttpMethod;
  path: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
}

export interface RequestLog {
  id: string;
  method: HttpMethod;
  path: string;
  status: number | "NET";
  requestBody?: string;
  responseBody: unknown;
  duration: number;
  time: Date;
}

export interface EndpointPreset {
  method: HttpMethod;
  path: string;
  label: string;
  description: string;
  body?: string;
  auth?: boolean;
}
