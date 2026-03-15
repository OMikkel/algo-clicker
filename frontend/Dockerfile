FROM node:20-alpine

WORKDIR /app

# Use pnpm to install deps from the existing lockfile
COPY package.json  .
COPY pnpm-lock.yaml .
RUN npm install -g pnpm@latest
RUN pnpm install --frozen-lockfile

# Copy rest of project and start the Vite dev server
COPY . .

EXPOSE 5173

CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
