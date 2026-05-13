# Pulseboard

Pulseboard is a community platform for discovering groups, joining conversations, and helping organizers build healthy, active spaces.

## Architecture

- `apps/api`: FastAPI backend
- `apps/web`: React frontend
- `packages/contracts`: shared API contracts for frontend consumption
- `infra/docker`: local infrastructure configuration

## Milestones

1. Repository bootstrap
2. Backend foundation
3. Authentication
4. Community domain
5. Discussions and moderation
6. API hardening and frontend handoff

## Current backend surface

- authentication flows with session rotation and recovery
- communities, memberships, and boards
- posts, comments, moderation basics, and audit events
- exported OpenAPI contract in `packages/contracts/openapi.json`
