export const composePlaceholder = `# Paste your Compose file (e.g. docker-compose.yaml or podman-compose.yaml) here.

# Below is an example for an app with 3 services:
# Postgres DB, Django backend and React frontend.

services:
\u00A0\u00A0db:
\u00A0\u00A0\u00A0\u00A0image: "docker.io/library/postgres:18-alpine"
\u00A0\u00A0\u00A0\u00A0container_name: postgres_db
\u00A0\u00A0\u00A0\u00A0environment:
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- POSTGRES_DB=\${DB_NAME}
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- POSTGRES_USER=\${DB_USER}
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- POSTGRES_PASSWORD=\${DB_PASSWORD}
\u00A0\u00A0\u00A0\u00A0volumes:
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- postgres_data:/var/lib/postgresql/data
\u00A0\u00A0\u00A0\u00A0networks:
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- app-network
\u00A0\u00A0\u00A0\u00A0restart: unless-stopped

\u00A0\u00A0backend:
\u00A0\u00A0\u00A0\u00A0image: "docker.io/library/python:3.14-slim"
\u00A0\u00A0\u00A0\u00A0build:
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0context: ./backend
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0dockerfile: Dockerfile
\u00A0\u00A0\u00A0\u00A0platform: linux/amd64
\u00A0\u00A0\u00A0\u00A0container_name: django_backend
\u00A0\u00A0\u00A0\u00A0command: python manage.py runserver 0.0.0.0:8000
\u00A0\u00A0\u00A0\u00A0volumes:
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- /run/rofl-appd.sock:/run/rofl-appd.sock
\u00A0\u00A0\u00A0\u00A0ports:
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0# Expose the Django development server
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- "8000:8000"
\u00A0\u00A0\u00A0\u00A0environment:
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- DB_ENGINE=django.db.backends.postgresql
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- DB_NAME=\${DB_NAME}
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- DB_USER=\${DB_USER}
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- DB_PASSWORD=\${DB_PASSWORD}
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- DB_HOST=db
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- DB_PORT=5432
\u00A0\u00A0\u00A0\u00A0depends_on:
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- db
\u00A0\u00A0\u00A0\u00A0networks:
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- app-network
\u00A0\u00A0\u00A0\u00A0restart: on-failure

\u00A0\u00A0frontend:
\u00A0\u00A0\u00A0\u00A0image: "docker.io/library/node:20-alpine"
\u00A0\u00A0\u00A0\u00A0build:
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0context: ./frontend
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0dockerfile: Dockerfile.dev
\u00A0\u00A0\u00A0\u00A0platform: linux/amd64
\u00A0\u00A0\u00A0\u00A0container_name: react_frontend
\u00A0\u00A0\u00A0\u00A0command: pnpm dev
\u00A0\u00A0\u00A0\u00A0ports:
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0# Expose the React dev server (Vite's default is 5173)
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- "5173:5173"
\u00A0\u00A0\u00A0\u00A0depends_on:
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- backend
\u00A0\u00A0\u00A0\u00A0networks:
\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0- app-network
\u00A0\u00A0\u00A0\u00A0restart: unless-stopped

volumes:
\u00A0\u00A0postgres_data:

networks:
\u00A0\u00A0app-network:
\u00A0\u00A0\u00A0\u00A0driver: bridge
`
