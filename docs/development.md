# Development

## Backend workflow

1. Start the database and mail services with `docker compose -f infra/docker/docker-compose.yml ...`.
2. Run the API checks through the `api` service or start the FastAPI app locally.
3. Export the OpenAPI schema after backend changes that affect the contract.
4. Seed demo data when you want a realistic local dataset.

## Contract output

The backend exports the current OpenAPI schema to `packages/contracts/openapi.json`.

## Frontend checks

The frontend supports:
- build
- lint
- typecheck
- Playwright smoke tests for the public entry shell
- a full browser-driven product flow against a local API server

## Seed data

Run the seed script to create a demo owner account, one public community, one board, one post, and one comment.
