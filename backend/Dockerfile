FROM node:20-alpine

WORKDIR /usr/src/app

# Copia tudo primeiro
COPY . .

# Instala deps
RUN npm install

# Prisma
RUN npx prisma generate

# Build
RUN npx nest build

EXPOSE 3000

CMD ["node", "dist/main.js"]