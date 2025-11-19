export const composePlaceholder = `# Paste your Compose file (e.g. docker-compose.yaml) here.
# Below is an example for an app with 3 services: Postgres DB, Django backend and React frontend.

services:
  db:
    image: docker.io/library/postgres:18-alpine
    environment:
      - POSTGRES_DB=\${DB_NAME}
      - POSTGRES_USER=\${DB_USER}
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data

  backend:
    image: docker.io/library/python:3.14-slim
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      # Socket used by ROFL Python Client to communicate with ROFL appd REST API.
      - /run/rofl-appd.sock:/run/rofl-appd.sock
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DB_ENGINE=django.db.backends.postgresql
      - DB_NAME=\${DB_NAME}
      - DB_USER=\${DB_USER}
      - DB_PASSWORD=\${DB_PASSWORD}
      - DB_HOST=db
      - DB_PORT=5432

  frontend:
    image: docker.io/library/node:20-alpine
    build: ./frontend
    command: pnpm dev
    ports:
      - "5173:5173"

volumes:
  pg_data:
`
