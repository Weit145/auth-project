service ?= auth gateway notification

.PHONY: submodules prepare up build logs_all logs_service delete down update

submodules:
	git submodule update --init --recursive

prepare: submodules
	@if [ ! -f .env ]; then cp .env.example .env; fi
	@if ! grep -Eq '^APP_UID=[0-9]+$$' .env; then \
		uid="$$(id -u)"; \
		if grep -q '^APP_UID=' .env; then \
			sed -i "s/^APP_UID=.*/APP_UID=$$uid/" .env; \
		else \
			printf 'APP_UID=%s\n' "$$uid" >> .env; \
		fi; \
	fi
	@if ! grep -Eq '^APP_GID=[0-9]+$$' .env; then \
		gid="$$(id -g)"; \
		if grep -q '^APP_GID=' .env; then \
			sed -i "s/^APP_GID=.*/APP_GID=$$gid/" .env; \
		else \
			printf 'APP_GID=%s\n' "$$gid" >> .env; \
		fi; \
	fi
	@if ! grep -Eq '^JWT_REFRESH_SECRET=.+$$' .env; then \
		secret="$$(openssl rand -hex 32)"; \
		if grep -q '^JWT_REFRESH_SECRET=' .env; then \
			sed -i "s/^JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$$secret/" .env; \
		else \
			printf '\nJWT_REFRESH_SECRET=%s\n' "$$secret" >> .env; \
		fi; \
		echo "Generated JWT_REFRESH_SECRET in .env"; \
	fi
	@if [ ! -f notification-startup/.env ]; then \
		cp notification-startup/.env.example notification-startup/.env; \
		echo "Created notification-startup/.env from .env.example"; \
	fi
	@sh scripts/prepare-dev-secrets.sh

up: prepare
	docker compose up -d

build: prepare
	docker compose up --build -d

logs_all:
	docker compose logs -f

logs_service:
	docker compose logs -f $(service) 

delete:
	docker compose down -v --remove-orphans

down:
	docker compose down
	
update:
	git submodule update --init --recursive --remote
