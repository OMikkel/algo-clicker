# Frontend Docker image for Vite + React
# Runs `pnpm dev` so that it can be live-reloaded during local development.

FROM node:20-alpine

WORKDIR /app

# Install pnpm & dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

EXPOSE 5173

# Start Vite dev server bound to 0.0.0.0 so it can be reached from outside the container.
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "5173"]
