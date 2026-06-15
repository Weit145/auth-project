# KLoad startup stack

## Запуск

```bash
make build
```

Команда создаёт локальные `.env`-файлы, записывает текущие `APP_UID/APP_GID`
и генерирует случайный `JWT_REFRESH_SECRET`, mTLS-сертификаты и JWT-ключи
через OpenSSL. Для production используйте сертификаты и секреты из
защищённого хранилища вместо локально сгенерированных файлов.

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
make prepare
make logs_all
make down
make delete
```
