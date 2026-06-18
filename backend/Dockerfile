FROM node:20-alpine AS deps

WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate


FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

RUN npm run build
RUN npm prune --omit=dev


FROM node:20-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN apk add --no-cache openssl curl

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]