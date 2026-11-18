# Operaciones del portal ISTQB Academy en Docker (Linux/macOS).
# En Windows usa istqb.ps1, que expone los mismos comandos.
.PHONY: help init up down restart status logs backup restore admin psql tunnel update

COMPOSE := docker compose
DB_USER ?= istqb
DB_NAME ?= istqb
DB_PASSWORD ?=

help:
	@echo "Uso: make <objetivo>"
	@echo "  init        Crea deploy/.env con secretos aleatorios"
	@echo "  up          Construye y arranca app, base y proxy"
	@echo "  down        Detiene y elimina contenedores (los datos se conservan)"
	@echo "  restart     Reinicia sin reconstruir"
	@echo "  status      Estado y healthchecks"
	@echo "  logs        Sigue los logs de la aplicacion"
	@echo "  backup      Respalda la base a backups/istqb-<fecha>.sql.gz"
	@echo "  restore     make restore FILE=backups/archivo.sql.gz  (destructivo)"
	@echo "  admin       make admin USER=mi-usuario"
	@echo "  psql        Consola SQL interactiva"
	@echo "  tunnel      Publica por tunel Cloudflare sin IP ni dominio"
	@echo "  update      Reconstruye la imagen con los cambios actuales"

init:
	@test -f .env || cp .env.example .env
	@tmp=$$(mktemp) && sed "s|^SESSION_SECRET=.*|SESSION_SECRET=$$(openssl rand -hex 32)|" .env > $$tmp && mv $$tmp .env
	@tmp=$$(mktemp) && sed "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$$(openssl rand -hex 32)|" .env > $$tmp && mv $$tmp .env
	@echo "deploy/.env creado con secretos aleatorios."

up:
	@test -f .env || $(MAKE) init
	$(COMPOSE) up -d --build
	@echo "Revisa SITE_ADDRESS en .env para saber como se publica el portal."

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

status:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f --tail 100 app

tunnel:
	@test -f .env || $(MAKE) init
	$(COMPOSE) --profile quick up -d --build
	@echo "Esperando la URL publica del tunel..."
	@sleep 8
	@$(COMPOSE) logs quicktunnel 2>&1 | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -n 1 \
	  | sed 's|^|Portal disponible en |' || echo "Aun no hay URL; revisa: docker compose logs quicktunnel"

backup:
	@mkdir -p backups
	@stamp=$$(date +%Y%m%d-%H%M%S); \
	$(COMPOSE) exec -T db sh -c 'pg_dump -U "$(DB_USER)" -d "$(DB_NAME)" --schema=academy | gzip -9 > /tmp/istqb-backup.sql.gz'; \
	$(COMPOSE) cp db:/tmp/istqb-backup.sql.gz backups/istqb-$$stamp.sql.gz; \
	$(COMPOSE) exec -T db rm -f /tmp/istqb-backup.sql.gz; \
	echo "Respaldo guardado en backups/istqb-$$stamp.sql.gz"

restore:
	@test -n "$(FILE)" || (echo "Uso: make restore FILE=backups/archivo.sql.gz" && exit 1)
	@echo "ATENCION: esto reemplaza TODOS los datos actuales."
	@read -p "Escribe SI para continuar: " ok && [ "$$ok" = "SI" ] || (echo "Cancelado." && exit 1)
	$(COMPOSE) cp $(FILE) db:/tmp/istqb-restore.sql.gz
	$(COMPOSE) exec -T db sh -c 'psql -U "$(DB_USER)" -d "$(DB_NAME)" -c "DROP SCHEMA academy CASCADE;"'
	$(COMPOSE) exec -T db sh -c 'gunzip -c /tmp/istqb-restore.sql.gz | psql -v ON_ERROR_STOP=1 -U "$(DB_USER)" -d "$(DB_NAME)"'
	$(COMPOSE) exec -T db rm -f /tmp/istqb-restore.sql.gz

admin:
	@test -n "$(USER)" || (echo "Uso: make admin USER=mi-usuario" && exit 1)
	$(COMPOSE) exec -T db psql -U $(DB_USER) -d $(DB_NAME) -c "UPDATE academy.users SET role='admin' WHERE username='$(USER)';"

psql:
	$(COMPOSE) exec db psql -U $(DB_USER) -d $(DB_NAME)

update:
	$(COMPOSE) build --pull
	$(COMPOSE) up -d
