FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install all deps (including devDeps) so that @nestjs/cli is available for the build
RUN npm ci

COPY . .

RUN npm run build

# Production image — only ship compiled output and prod deps
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
