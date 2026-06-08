# KLoad startup stack

## Запуск

```bash
make build
```

После запуска доступны:

- API testing console: http://localhost:3000
- Swagger: http://localhost:3000/swagger/index.html
- Gateway API: http://localhost:8080

Frontend покрывает полный auth-flow: health check, регистрацию, подтверждение email,
login, refresh token, logout, просмотр JWT и историю HTTP-запросов.

Ссылка подтверждения из email ведёт на frontend и автоматически заполняет token и
user ID. Для другого адреса задайте `EMAIL_VERIFICATION_URL` у auth-сервиса.

## Команды

```bash
make up
make logs_all
make down
make delete
```
