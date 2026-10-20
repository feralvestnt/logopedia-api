# Logopedia API

An Express and MongoDB API for the Logopedia lesson board. The current API
provides `GET /lessons`, returning lessons ordered by scheduled date.

## Requirements

- Node.js and npm
- MongoDB

## Run locally

1. Install dependencies with `npm install`.
2. Start both the frontend and API from the frontend repository with `npm run dev`.

The API listens on port `3002` by default. The demo login is **adm** / **adm**.
No database is required for login or the empty lesson board. To use MongoDB,
set `USE_MONGODB=true` and `MONGODB_URI` in `.env`.

The mock login creates temporary in-memory sessions and is only for local
development; restart the API to clear them. Do not use it as production
authentication.

## Lesson document

The `lessons` collection uses this shape:

```json
{
  "title": "Consciência fonológica",
  "description": "Atividade de rimas e sons iniciais.",
  "scheduledAt": "2026-10-21T10:00:00.000Z",
  "durationMinutes": 45
}
```

`title` is required. `description`, `scheduledAt`, and `durationMinutes` are
optional. Add lesson documents to MongoDB to have them appear on the frontend
board.
