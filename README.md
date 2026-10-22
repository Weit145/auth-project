# Auth project

Auth project (KLoad) — стенд регистрации и аутентификации пользователей. Он включает веб-интерфейс для проверки API, HTTP-шлюз, сервис учётных записей и асинхронную отправку писем. Поддерживаются подтверждение email, вход, обновление и отзыв сессий, смена и восстановление пароля.

Репозиторий стека — [Weit145/auth-project](https://github.com/Weit145/auth-project).
Сервисы подключены как Git submodules: [Auth](https://github.com/Weit145/auth-startup),
[Gateway](https://github.com/Weit145/gateway-project-service) и
[Notification](https://github.com/Weit145/notification-startup).
Локальные каталоги подмодулей сохраняют имена `auth-startup`, `gateway-startup` и `notification-startup`.

## Системный контекст — C4 Level 1

![Системный контекст KLoad](docs/diagrams/c4-context.png)

[Открыть SVG](docs/diagrams/c4-context.svg) · [Исходник PlantUML](docs/diagrams/c4-context.puml)

## Архитектура — C4 Level 2

![Контейнерная диаграмма KLoad](docs/diagrams/c4-container.png)

[Открыть SVG](docs/diagrams/c4-container.svg) · [Исходник PlantUML](docs/diagrams/c4-container.puml)

| Контейнер | Назначение |
| --- | --- |
| Frontend | Статическая страница и API-консоль; nginx направляет запросы `/api/*` в Gateway. |
| Gateway | Публичный HTTP/JSON API, проверка JWT и ограничение частоты запросов. Вызывает Auth по gRPC с mTLS. |
| Auth | Логика регистрации и сессий, выпуск JWT, транзакции PostgreSQL и публикация событий из outbox. |
| Notification consumer и worker | Получают события через Kafka, передают задачи через RabbitMQ и отправляют письма через SMTP. |

Путь запроса: браузер → Frontend → Gateway → Auth → PostgreSQL. Для писем Auth записывает событие в `event_outbox` вместе с изменением данных; отдельный worker публикует его в Kafka. Notification consumer ставит задачу в RabbitMQ, а Celery worker отправляет письмо. Gateway использует Redis для rate limiting; notification worker использует SQLite для предотвращения повторной отправки письма.

## Схема данных

![Обзор хранилищ KLoad](docs/diagrams/database.png)

[Открыть SVG](docs/diagrams/database.svg) · [Исходник PlantUML](docs/diagrams/database.puml)

| Хранилище | Данные и связи |
| --- | --- |
| PostgreSQL | `users` — основная запись. Таблицы `email_verification_tokens`, `registration_sessions`, `refresh_sessions` и `password_reset_tokens` связаны с ней по `user_id` с удалением по каскаду. `event_outbox` хранит события для отправки; его `user_id` не объявлен внешним ключом. |
| Redis | Временные ключи `rate_limit:ip:*`, `rate_limit:user:id:*` и `rate_limit:email:*`. Постоянных пользовательских записей Gateway здесь нет. |
| SQLite | Таблица `email_send_idempotency` у notification worker: ключ отправки, статус и время изменения. |

Подробности: [схема Auth](https://github.com/Weit145/auth-startup/blob/confirm-email/docs/diagrams/database.png) и [ключи Gateway](https://github.com/Weit145/gateway-project-service/blob/main/docs/diagrams/database.png). Kafka и RabbitMQ передают события и задачи, но не являются схемой пользовательских данных.

## Основной сценарий

![Путь пользователя: регистрация и начало работы](docs/diagrams/cjm.png)

[Открыть SVG](docs/diagrams/cjm.svg) · [Исходник PlantUML](docs/diagrams/cjm.puml)

1. `POST /register/request` принимает email. Auth создаёт ожидающего пользователя, токен подтверждения и событие письма в одной транзакции.
2. Пользователь переходит по ссылке из письма. `POST /register/confirm` принимает `token` и `userId` и возвращает временный JWT для завершения регистрации.
3. `POST /register/complete` принимает пароль и временный JWT в `Authorization: Bearer …`. Auth задаёт пароль, создаёт refresh-сессию и выдаёт обычный access JWT. Gateway записывает refresh token в `HttpOnly` cookie.

После регистрации доступны `/auth/login`, `/auth/refresh-token`, `/auth/logout`, смена и восстановление пароля. Полный список маршрутов приведён в [README Gateway](https://github.com/Weit145/gateway-project-service#readme).

## Запуск

Клонирование стека вместе с подмодулями:

```bash
git clone --recurse-submodules https://github.com/Weit145/auth-project.git
cd auth-project
```

Из корня репозитория:

```bash
make build
```

Команда инициализирует submodules, создаёт локальные `.env`, ключи JWT и сертификаты mTLS, затем запускает Docker Compose. Для отправки писем нужно настроить SMTP-параметры в `notification-startup/.env`. Для production используйте собственные секреты и сертификаты.

| Адрес | Сервис |
| --- | --- |
| http://localhost:3000 | Frontend и API-консоль |
| http://localhost:3000/swagger/index.html | Swagger через frontend |
| http://localhost:8080 | Gateway API |

Полезные команды: `make logs_all` — логи, `make down` — остановка. `make delete` дополнительно удаляет volumes с данными.

## Диаграммы и документация сервисов

Все диаграммы находятся в [docs](docs/README.md), [Auth docs](https://github.com/Weit145/auth-startup/blob/confirm-email/docs/README.md) и [Gateway docs](https://github.com/Weit145/gateway-project-service/blob/main/docs/README.md). Рядом с PNG лежат SVG и исходники PlantUML. За компонентами и внутренней схемой данных обратитесь к [README Auth](https://github.com/Weit145/auth-startup/tree/confirm-email#readme) и [README Gateway](https://github.com/Weit145/gateway-project-service#readme).
