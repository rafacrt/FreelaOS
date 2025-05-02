# Etapa 1: build do TypeScript
FROM node:20-alpine AS build

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./
RUN npm run build

# Etapa 2: imagem final
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY backend/.env ./

CMD ["node", "dist/index.js"]
