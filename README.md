# Pulseboard

Pulseboard is a community platform for discovering groups, joining conversations, and helping organizers build healthy, active spaces. The repository contains a complete backend, a React frontend, generated API contracts, and browser-based verification for the core product flow.

## What is implemented

### Product capabilities
- email/password authentication
- registration, login, logout, session refresh
- email verification and password reset routes
- community discovery and creation
- memberships and join/leave flows
- board creation and board feeds
- post creation, post detail, post updates, and comments
- moderation actions for posts: pin, unpin, lock, unlock, delete
- account page with password change flow

### Backend surface
The FastAPI backend currently exposes:
- health and readiness endpoints
- auth routes under `/api/v1/auth`
- community and board routes under `/api/v1/communities`
- discussion routes for boards, posts, comments, and moderation

The route aggregation lives in [router.py](apps/api/app/api/router.py).

## Repository layout

```text
pulseboard/
  apps/
    api/                 # FastAPI backend
    web/                 # React + Vite frontend
  packages/
    contracts/           # exported OpenAPI contract + generated TS types
  docs/
  infra/
    docker/
      docker-compose.yml
  .github/workflows/
```

### Key areas
- [apps/api/](apps/api/) — backend app, routes, models, tests, and scripts
- [apps/web/](apps/web/) — frontend routes, feature modules, Playwright tests
- [packages/contracts/](packages/contracts/) — OpenAPI artifact and generated TypeScript schema
- [docs/development.md](docs/development.md) — focused developer workflow notes

## Tech stack

### Backend
- FastAPI
- SQLAlchemy
- Alembic scaffolding
- Pydantic settings
- Postgres for the main local database path
- pytest, Ruff, and mypy

### Frontend
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- `openapi-fetch`
- Playwright

### Contracts
- OpenAPI exported from the backend
- TypeScript schema generation through `openapi-typescript`

## Local development

### Prerequisites
- Node.js 24+
- Python 3.11+ for the backend workflow
- Docker for local dependency containers

### Start local dependencies
Use Docker Compose for the shared backend dependencies:

```bash
docker compose -f infra/docker/docker-compose.yml up db mailpit
```

### Backend workflow
Run the backend checks through the existing API tooling in [apps/api/](apps/api/):
- export the contract
- run tests
- lint and typecheck
- seed local demo data when needed

Helpful backend files:
- [pyproject.toml](apps/api/pyproject.toml)
- [seed_demo.py](apps/api/scripts/seed_demo.py)
- [export_openapi.py](apps/api/scripts/export_openapi.py)

### Frontend workflow
From the repository root:

```bash
npm install
npm run generate:contracts
npm run dev:web
```

Other frontend commands:

```bash
npm run build:web
npm run lint:web
npm run typecheck:web
npm run test:e2e:web
```

## Contracts

The backend exports the current OpenAPI schema to:
- [openapi.json](packages/contracts/openapi.json)

The generated TypeScript entrypoint lives in:
- [index.ts](packages/contracts/src/index.ts)

The frontend consumes the contracts package directly instead of hand-maintaining parallel DTOs.

## Seed data

The seed script creates a realistic local baseline:
- a verified owner account
- one demo community
- one board
- one post
- one comment

Seed file:
- [seed_demo.py](apps/api/scripts/seed_demo.py)

## Testing and verification

### Backend
The backend is covered by:
- unit and integration-style pytest coverage in [tests/](apps/api/tests/)
- migration smoke coverage
- OpenAPI contract export coverage
- lint and typecheck enforcement in CI

### Frontend
The frontend is covered by:
- build
- lint
- typecheck
- Playwright browser tests in [tests/e2e/](apps/web/tests/e2e/)

Current Playwright coverage includes:
- app shell smoke
- auth route smoke
- register + session persistence + create community flow
- seeded owner discussion and moderation flow

Playwright config:
- [playwright.config.ts](apps/web/playwright.config.ts)

## CI

CI runs both backend and frontend verification from:
- [ci.yml](.github/workflows/ci.yml)

Current CI responsibilities:
- backend install, lint, typecheck, and pytest
- frontend dependency install, contract generation, build, lint, typecheck
- Playwright browser smoke and product-flow coverage

## Current frontend routes

Implemented frontend routes include:
- `/communities`
- `/communities/:slug`
- `/communities/:slug/boards/:boardSlug`
- `/posts/:postId`
- `/account`
- `/login`
- `/register`
- `/verify-email`
- `/forgot-password`
- `/reset-password`

Router file:
- [router.tsx](apps/web/src/app/router.tsx)
