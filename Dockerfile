
# 1. Imagem base
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

# 2. Desenvolvimento
FROM base AS dev

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "-p", "3000"]

# 3. Build de produção
FROM base AS builder

RUN npm install

COPY . .

ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# 4. Produção
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "start", "--", "-p", "3000"]
