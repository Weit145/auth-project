import type { EndpointPreset } from "@/types/api";

export const endpointPresets: EndpointPreset[] = [
  {
    method: "GET",
    path: "/_health",
    label: "Health check",
    description: "Gateway, auth и база данных",
  },
  {
    method: "POST",
    path: "/auth/register",
    label: "Register",
    description: "Создать пользователя",
    body: '{\n  "name": "Test User",\n  "email": "",\n  "password": "Test12345"\n}',
  },
  {
    method: "POST",
    path: "/auth/confirm-email",
    label: "Confirm email",
    description: "Активировать пользователя",
    body: '{\n  "token": "",\n  "userId": ""\n}',
  },
  {
    method: "POST",
    path: "/auth/login",
    label: "Login",
    description: "Создать сессию",
    body: '{\n  "email": "",\n  "password": "Test12345"\n}',
  },
  {
    method: "POST",
    path: "/auth/refresh-token",
    label: "Refresh token",
    description: "Обновить access token",
  },
  {
    method: "POST",
    path: "/auth/logout",
    label: "Logout",
    description: "Отозвать refresh-сессию",
    auth: true,
  },
];
