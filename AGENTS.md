# StudyPilot AI Server

## Overview

Express 5 + TypeScript backend server using MongoDB (native driver) and Better Auth for authentication.

## Commands

- `npm run dev` — Start dev server with hot-reload (tsx watch)
- `npm run build` — Compile TypeScript to `./dist`
- `npm run start` — Run production build from `./dist/server.js`

## Architecture

3-tier layered architecture:

```
Routes → Controllers → Services → MongoDB
  ↕
Middleware (auth, error handling)
```

- `src/config/` — Infrastructure: database, auth, environment
- `src/routes/` — Express Routers, URL paths
- `src/controllers/` — Parse input, call services, format responses
- `src/services/` — Business logic, direct DB queries
- `src/middleware/` — Cross-cutting: auth verification, error handling
- `src/types/` — TypeScript ambient declarations
- `src/utils/` — Stateless helper functions

Split bootstrap: `app.ts` creates/configures the Express app, `server.ts` handles DB connection, listening, and graceful shutdown.

## Code Style

- **2 spaces** indentation
- **Double quotes** for all strings
- **Semicolons** always
- **Trailing commas** in multi-line constructs
- **camelCase** for files, directories, variables, functions
- **PascalCase** for interfaces and types
- **UPPER_SNAKE_CASE** only for env var keys
- K&R brace style (opening brace on same line)

## TypeScript

- Strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`
- Use `import type` for type-only imports
- Module resolution: `nodenext` — all relative imports **must** use `.js` extensions (e.g., `import { env } from "./config/env.js"`)
- No explicit return types unless required (inferred)
- Target: `esnext`

## Imports

ESM throughout. Order: third-party packages first, then relative local imports.

```typescript
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
```

## Database

- MongoDB Native Driver (v7), **not Mongoose**
- `MongoClient` and `Db` created in `src/config/db.ts`, exported as singletons
- `connectDB()` / `closeDB()` for lifecycle management
- No application-level schemas yet — Better Auth manages its own collections

## Authentication

- Better Auth with `mongodbAdapter`
- Auth routes mounted at `/api/auth/*splat` (Express 5 named wildcard)
- `requireAuth` middleware extracts session, injects `req.user` and `req.session`
- Type augmentation in `src/types/express.d.ts` adds `user` and `session` to `Express.Request`

## Error Handling

- Custom errors extend `Error` with optional `statusCode`
- Global error handler in `src/middleware/errorHandler.ts` returns:
  ```json
  { "success": false, "error": { "message": "...", "statusCode": 500, "stack": "..." } }
  ```
- Stack trace only in non-production
- Pattern: catch → log → re-throw or delegate to global handler
- Log format: `[Tag]` prefix (e.g., `[Server]`, `[Database]`, `[Error]`)

## Configuration

- Environment variables loaded via `dotenv` in `src/config/env.ts`
- Validates required vars at import time; throws if missing (fail-fast)
- `.env` is gitignored — never commit secrets

## Express 5 Notes

- Wildcard routes require named params: `*splat` not `*`
- Better Auth handler mounted before body parsers (needs raw stream)

## Response Conventions

- Errors: `{ success: false, error: { message, statusCode, stack? } }`
- Health check: `{ status: "OK", service, timestamp }`
