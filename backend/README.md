# Safinity Backend

NestJS API for the Safinity mobile app.

This service handles authentication, user sync, events, activities, tickets, friends, QR flows, realtime notifications, SOS requests, maps, sensors and crowd-density data.

## Run Locally

From the repository root, the easiest path is Docker:

```bash
docker compose up -d --build
```

The API should answer at:

```text
http://localhost:3000/health
```

To run only the API outside Docker:

```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```

Make sure `DATABASE_URL` points to a reachable PostgreSQL/PostGIS database.

## Required Environment

```env
PORT=3000
DATABASE_URL=<postgres-connection-url>
CLERK_SECRET_KEY=sk_test_xxxxxxxxx
MAPBOX_TOKEN=pk.xxxxxxxxx
SENSOR_WEBHOOK_SECRET=change_me
ENABLE_SWAGGER=true
```

For Render/Supabase:

```env
DATABASE_URL=<supabase-postgres-url-with-ssl>
ENABLE_SWAGGER=false
NODE_ENV=production
```

## Scripts

```bash
npm run build
npm run start:dev
npm run start:prod
npm run lint:check
npm test -- --runInBand
npx prisma generate
```

## API Docs

Swagger is available at:

```text
http://localhost:3000/api
```

It is only registered when:

```env
ENABLE_SWAGGER !== false
```
