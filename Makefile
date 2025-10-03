APP_SERVICE := app
DB_SERVICE := db

# Sobe api e banco (app + db)
up:
	docker-compose up --build

# Sobe apenas a aplicação
up-app:
	docker-compose up -d --build $(APP_SERVICE)

# Sobe apenas o banco
up-db:
	docker-compose up -d --build $(DB_SERVICE)

# Para todos os serviços
down:
	docker-compose down

# Vê logs da aplicação
logs-app:
	docker-compose logs -f $(APP_SERVICE)

# Vê logs do banco
logs-db:
	docker-compose logs -f $(DB_SERVICE)

# Reinicia todos os serviços
restart:
	docker-compose down
	docker-compose up --build

ps:
	docker-compose ps
