service ?= auth gateway notification

up:
	docker compose up -d

build:
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