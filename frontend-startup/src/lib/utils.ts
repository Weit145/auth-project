import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatJson(value: unknown) {
  if (value === undefined || value === null || value === "") return "";

  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  return JSON.stringify(value, null, 2);
}

export function createTestCredentials() {
  return {
    email: `test${Date.now().toString().slice(-8)}@mail.ru`,
    password: "Test12345",
  };
}
