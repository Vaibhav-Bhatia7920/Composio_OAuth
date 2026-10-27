.PHONY: up down build logs

up:
	docker compose up

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f
