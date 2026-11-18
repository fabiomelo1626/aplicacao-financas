# 1. Base Image
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# 2. Stage de Desenvolvimento
FROM base AS dev
WORKDIR /app
RUN npm install
COPY . .
# Força o Next.js em dev a ouvir explicitamente na porta 3001
CMD ["npm", "run", "dev", "--", "-p", "3002"]

# 3. Stage de Build (Produção)
FROM base AS builder
WORKDIR /app
RUN npm install
COPY . .
# Injeta a URL no momento do build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# 4. Stage de Produção (Runner - Imagem leve)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001
# Em produção, apenas inicia o servidor compilado especificando a porta 3001
CMD ["npm", "run", "start", "--", "-p", "3002"]