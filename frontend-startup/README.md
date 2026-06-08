# KLoad API Testing Console

Статический frontend для ручной проверки gateway/auth flow.

После запуска корневого Docker Compose откройте:

- UI: http://localhost:3000
- Swagger через frontend proxy: http://localhost:3000/swagger/index.html

Frontend отправляет запросы на `/api/*`; Nginx проксирует их в `gateway:8080`.
Благодаря одному origin браузер может использовать HttpOnly refresh cookie без CORS-настроек.
