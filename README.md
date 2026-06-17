# Safinity

![Safinity mockups](readme/mockups2.png)

Safinity is a mobile-first event safety app built with Expo, React Native, NestJS, PostgreSQL/PostGIS, Clerk and Mapbox.

The app helps people navigate large events safely: users can link tickets, see event maps, check activities, add friends, scan QR codes, share SOS requests, receive realtime notifications and view crowd-density heatmaps.

---

## Contents

- [Project Structure](#project-structure)
- [Main Features](#main-features)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Run With Docker](#run-with-docker)
- [Run The Frontend](#run-the-frontend)
- [Run Backend Locally Without Docker](#run-backend-locally-without-docker)
- [Database](#database)
- [Useful Commands](#useful-commands)
- [Manual Test Checklist](#manual-test-checklist)
- [Troubleshooting](#troubleshooting)
- [Authors](#authors)

---

## Project Structure

```text
Safinity-app/
├── backend/                  # NestJS API
│   ├── prisma/
│   │   └── schema.prisma     # Prisma schema mapped to PostgreSQL/PostGIS
│   ├── src/
│   │   ├── alerts/           # Alerts created from SOS and event conditions
│   │   ├── auth/             # Clerk JWT validation and authenticated user sync
│   │   ├── common/           # Shared filters, DTOs and helpers
│   │   ├── events/           # Events, activities, maps and Mapbox static maps
│   │   ├── friends/          # Friend search, requests, QR add and friendship states
│   │   ├── notifications/    # Notifications API and realtime WebSocket server
│   │   ├── prisma/           # Prisma service
│   │   ├── sensors/          # Crowd-density sensors and webhook ingestion
│   │   ├── sos/              # SOS requests and friend SOS notifications
│   │   ├── tickets/          # Ticket code linking and user tickets
│   │   └── users/            # Profile, account and user data
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # Expo / React Native app
│   ├── app/                  # expo-router screens and routes
│   │   ├── (tabs)/           # Main tab pages: home, map, calendar, friends...
│   │   ├── activity-details/ # Activity details route
│   │   ├── event-details/    # Event details route
│   │   ├── onboarding/       # Login/onboarding screens
│   │   ├── sos.tsx           # SOS flow
│   │   └── qrcode-scan.tsx   # QR friend scanner
│   ├── assets/               # Images, icons, logos and fonts
│   ├── components/           # Reusable UI and feature components
│   ├── constants/            # Theme and app constants
│   ├── context/              # App-wide providers and state
│   ├── data/                 # Static fallback data
│   ├── utils/                # API client, formatting and helpers
│   └── package.json
│
├── backoffice/               # Backoffice/admin frontend workspace
├── db/
│   └── init.sql              # Database bootstrap and seed data for Docker
├── docker-compose.yml        # PostGIS database + NestJS API
├── readme/                   # README images/mockups
└── README.md
```

![Safinity pages](readme/mockups.png)

---

## Main Features

- Clerk authentication with backend JWT validation.
- Automatic user sync into the local database after login.
- Dynamic profile, edit profile, password/settings, wallet and ticket pages.
- Event listing, event details, activity details and category filters backed by the database.
- Ticket linking from event details and wallet.
- Dynamic event calendar with favorite activities and app-wide state provider.
- Friend search from database users, friend requests, accepted/pending/remove states and QR-code add flow.
- Realtime notifications via WebSocket.
- Friend SOS notifications for friends attending the same active event.
- Dynamic event maps with Mapbox static map images served through the backend.
- Points of interest, stages, friend/user location and crowd-density heatmap sensors.

---

## Prerequisites

Install these first:

- Node.js 20 or newer.
- npm.
- Docker Desktop.
- Expo Go compatible with SDK 54, or an iOS/Android simulator.
- A Clerk application.
- A Mapbox token.

The frontend currently uses:

```text
Expo SDK 54
React Native 0.81
React 19
```

This matters for Expo Go. If the phone has an Expo Go version that only supports another SDK, the app may open in the Xcode simulator but fail on the physical iPhone.

---

## Environment Variables

You need three env files: one at the project root, one in `backend/`, and one in `frontend/`.

Do not commit real secrets.

### Root `.env`

Used by `docker-compose.yml`.

```env
DB_NAME=safinity
DB_USER=safinity
DB_PASSWORD=safinity_password
DB_HOST=database
DB_PORT=5432
API_PORT=3000
DATABASE_URL=postgresql://safinity:safinity_password@database:5432/safinity?schema=public
```

When the API runs inside Docker, `DB_HOST` must be `database` because that is the Compose service name.

### `backend/.env`

Used by the NestJS API.

```env
PORT=3000
DATABASE_URL=postgresql://safinity:safinity_password@database:5432/safinity?schema=public
CLERK_SECRET_KEY=sk_test_xxxxxxxxx
MAPBOX_TOKEN=pk.xxxxxxxxx
SENSOR_WEBHOOK_SECRET=change_me
```

`CLERK_SECRET_KEY` comes from Clerk Dashboard:

```text
Clerk Dashboard -> Configure -> API keys -> Secret key
```

`MAPBOX_TOKEN` is used by the backend to request static map images from Mapbox.

`SENSOR_WEBHOOK_SECRET` is used to protect sensor/webhook ingestion endpoints.

### `frontend/.env`

Used by Expo. Every variable that must be available in the app needs the `EXPO_PUBLIC_` prefix.

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxx
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Usually you do not need to change `EXPO_PUBLIC_API_URL` manually. The frontend API client tries to infer the Expo host IP and call:

```text
http://<expo-host-ip>:3000
```

That is what lets a real phone call the API running on your laptop, as long as both devices are on the same network and port `3000` is reachable.

---

## Run With Docker

From the project root:

```bash
docker compose up -d --build
```

This starts:

- `safinity-db`: PostgreSQL with PostGIS.
- `safinity-api`: NestJS API on port `3000`.

---

## Run The Frontend

Install frontend dependencies:

```bash
cd frontend
npm install
```

Start Expo Go mode:

```bash
npm run start
```

Then choose one:

- Scan the QR code with Expo Go on a physical phone.
- Press `i` to open the iOS simulator.
- Press `a` to open an Android emulator.

For a physical phone:

- The phone and laptop must be on the same network.
- Docker must be running.
- The API must answer on `http://<your-laptop-ip>:3000/health`.
- Some networks block device-to-device traffic. If that happens, use a hotspot or another Wi-Fi network.

Other frontend commands:

```bash
npm run ios
npm run android
npm run web
npm run lint
npm run format:check
```

---

## Run Backend Locally Without Docker

Use this only if you want the API running outside the container.

Start only the database:

```bash
docker compose up -d database
```

Change `backend/.env` to point to localhost:

```env
DATABASE_URL=postgresql://safinity:safinity_password@localhost:5432/safinity?schema=public
```

Then run:

```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```

The API should be available at:

```text
http://localhost:3000
```

---

## Database

The database is PostgreSQL with PostGIS. It stores:

- Users synced from Clerk.
- Events and event images.
- Activities and favorite activities.
- Tickets and ticket master codes.
- Friendships and friend request states.
- Notifications and per-user read state.
- SOS requests and alerts.
- Points of interest, stages, sensors and user locations.

Open a database shell:

```bash
docker exec -it safinity-db psql -U safinity -d safinity
```

Useful SQL examples:

```sql
select id, name, username, email, role from users order by name;
select id, name, status, start_date, end_date from event order by id;
select user_id, event_id, ticket_code from user_tickets order by linked_at desc;
select id, title, category, event_id, time from notifications order by time desc;
```

---

## Useful Commands

Project root:

```bash
docker compose up -d --build
docker compose down
docker ps
docker logs -f safinity-api
docker logs -f safinity-db
curl -i http://localhost:3000/health
```

Backend:

```bash
cd backend
npm run build
npm run lint:check
npm run test
npx prisma generate
```

Frontend:

```bash
cd frontend
npm run start
npm run lint
npm run format:check
```

Git sanity check before commit:

```bash
git status
git diff --stat
```

---

## Troubleshooting

### `Cannot connect to the Docker daemon`

Docker Desktop is not running or the daemon is still starting.

Run:

```bash
docker info
```

If the server section fails, open Docker Desktop and wait until it is fully started.

### API container is unhealthy

Check logs:

```bash
docker logs --tail 150 safinity-api
```

Most common causes:

- Missing `CLERK_SECRET_KEY`.
- Wrong `DATABASE_URL`.
- Database container is not healthy.
- Port `3000` is already being used.

### Expo Go says the project is incompatible

The project uses Expo SDK 54.

Expo Go on the phone must support SDK 54. If the App Store version does not match the SDK you need, use the iOS simulator, Android emulator, or upgrade the project SDK deliberately.

### Physical phone gets `Network Error`

Check these in order:

```bash
curl -i http://localhost:3000/health
```

Then from the phone browser:

```text
http://<your-laptop-ip>:3000/health
```

If the phone cannot open it:

- Make sure phone and laptop are on the same network.
- Avoid networks that isolate clients, such as some university networks.
- Try a phone hotspot.
- Check macOS firewall settings.
- Confirm Docker exposes `0.0.0.0:3000->3000/tcp`.

### Clerk login verifies password but does not enter the app

Common checks:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` exists in `frontend/.env`.
- `CLERK_SECRET_KEY` exists in `backend/.env`.
- The API is reachable from the phone.
- Logout completely and sign in again.
- Restart Expo after changing env variables.

### Camera does not work for QR scanner

Grant camera permission to Expo Go or the simulator:

```text
iOS Settings -> Expo Go -> Camera
```

Then reload the app.

### Mapbox map is blank

Check:

- `MAPBOX_TOKEN` exists in `backend/.env`.
- The token has access to Mapbox Static Images API.
- The event has valid coordinates in the database.
- The API logs do not show Mapbox request errors.

### Env changes do not appear in Expo

Restart Expo after changing `.env`:

```bash
cd frontend
npx expo start --go --clear
```

---

## Tech Stack

- Expo SDK 54
- React Native
- expo-router
- TypeScript
- styled-components
- Clerk
- NestJS
- Prisma
- PostgreSQL
- PostGIS
- WebSocket realtime notifications
- Mapbox Static Images API
- Docker Compose

---

## Authors

- [André Dora](https://github.com/andredora)
- [Beatriz Castro](https://github.com/castro-beatriz)
- [Inês Ferreira](https://github.com/inesitadivertida02)
- [Marta Silva](https://github.com/martacss)
- [Sara Pombo](https://github.com/sarapombo)
