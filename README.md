# Food Ordering API

NestJS backend for a food ordering platform (TypeScript).

## Setup

1. **Prerequisites**: Node.js 18+, PostgreSQL, Redis (for BullMQ).

2. **Environment**: Copy `.env.example` to `.env` and set variables (DB, JWT_SECRET, Redis).

3. **Database**: Create a PostgreSQL database (e.g. `food_ordering`) and set `DB_*` in `.env`.

4. **Install**: `npm install`

5. **Run**: `npm run start:dev` (API at http://localhost:3000, Swagger at http://localhost:3000/api/docs)

6. **Tests**: `npm run test`

## API Documentation

Swagger UI: `GET /api/docs` when the server is running.
