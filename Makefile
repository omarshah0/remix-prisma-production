# Database configuration
DB_NAME=remixapp
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=12121
CONTAINER_NAME=remix-postgres

# Docker commands
.PHONY: db-start db-stop db-restart db-create db-drop db-reset db-logs

# Start PostgreSQL container
db-start:
	@docker run --name $(CONTAINER_NAME) \
		-e POSTGRES_DB=$(DB_NAME) \
		-e POSTGRES_USER=$(DB_USER) \
		-e POSTGRES_PASSWORD=$(DB_PASSWORD) \
		-p $(DB_PORT):5432 \
		-d postgres:latest

# Stop and remove container
db-stop:
	@docker stop $(CONTAINER_NAME) || true
	@docker rm $(CONTAINER_NAME) || true

# Restart database
db-restart: db-stop db-start

# Create database
db-create:
	@docker exec -it $(CONTAINER_NAME) createdb --username=$(DB_USER) --owner=$(DB_USER) $(DB_NAME)

# Drop database
db-drop:
	@docker exec -it $(CONTAINER_NAME) dropdb --username=$(DB_USER) $(DB_NAME)

# Reset database (drop and create)
db-reset: db-drop db-create

# View database logs
db-logs:
	@docker logs $(CONTAINER_NAME)

# Initialize project (first time setup)
init: db-start
	@echo "Waiting for database to start..."
	@sleep 3
	npx prisma generate
	npx prisma db push
	@echo "Database URL: postgresql://$(DB_USER):$(DB_PASSWORD)@localhost:$(DB_PORT)/$(DB_NAME)" 