APP_SERVICE := app
DB_SERVICE := db

up:
	docker-compose up -d --build $(DB_SERVICE)
	docker-compose up --build $(APP_SERVICE)

up-app:
	docker-compose up -d --build $(APP_SERVICE)

up-db:
	docker-compose up -d --build $(DB_SERVICE)

down:
	docker-compose down

logs-app:
	docker-compose logs -f $(APP_SERVICE)

logs-db:
	docker-compose logs -f $(DB_SERVICE)

restart:
	docker-compose down
	docker-compose up --build

ps:
	docker-compose ps
