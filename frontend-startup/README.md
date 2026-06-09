# KLoad Auth Desk

React + TypeScript frontend для проверки полного gateway/auth flow.

## Стек

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- локальные UI-компоненты в стиле shadcn/ui
- Motion для переходов и ambient-анимаций
- TanStack Query для server state
- React Hook Form + Zod для форм
- Lucide Icons и Sonner

Визуальный слой использует адаптивные liquid-glass панели, динамический aurora-фон,
Motion-переходы, интерактивное свечение за курсором и анимированную схему
auth-контура. При включённом `prefers-reduced-motion` анимации автоматически
сокращаются.

## Запуск всего стека

Из корня репозитория:

```bash
make build
```

Откройте:

- Auth Desk: http://localhost:3000
- Swagger: http://localhost:3000/swagger/index.html

## Локальная frontend-разработка

Из корня репозитория запустите backend без production frontend:

```bash
docker compose up -d gateway auth notification notification-worker kafka rabbitmq db
```

Затем:

```bash
cd frontend-startup
npm install
npm run dev
```

Vite откроет frontend на http://localhost:3000 и проксирует `/api/*` в
`http://localhost:8080`.

## Проверки

```bash
npm run build
npm run lint
```

Production-образ собирает приложение через Node и раздаёт готовый `dist` через
nginx. Один origin сохраняет работу HttpOnly refresh cookie без CORS-настроек.
