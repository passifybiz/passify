# Contributing to Passify

Thanks for your interest in improving Passify. This guide covers how to set up
the project, the standards we hold code to, and how to get a change merged.

By participating you agree to our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Ways to contribute

- **Report bugs** with a minimal reproduction (use the Bug report template).
- **Propose features** and discuss design before large changes (Feature request
  template or a Discussion).
- **Improve documentation** — fixes to the README, SDK docs, or the OpenAPI
  spec are always welcome.
- **Submit code** for an issue that is accepted and scoped.

For anything non-trivial, open an issue first so we can agree on the approach
before you invest time.

## Project setup

Prerequisites: **Node.js 22+** and **npm**. Docker is optional (for Postgres and
Redis); without it the dev server falls back to SQLite and an in-memory cache.

```bash
git clone https://github.com/passifybiz/passify.git
cd passify
cp .env.example .env
npm install
npm run dev          # http://localhost:3000 (SQLite fallback, auto-seeded)
```

To run against Postgres and Redis:

```bash
docker compose up -d
npm run db:migrate:apply
npm run db:seed
npm run dev
```

## Before you open a pull request

Run the full local check suite. CI runs the same steps and must pass.

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

- Add or update tests for any behavior you change. Tests live in
  `src/__tests__/`.
- If you change the API surface, regenerate the OpenAPI spec with
  `npm run openapi:gen` and keep `openapi.yaml` in sync.
- If you change the database schema (`drizzle/schema.ts`), generate a migration
  with `npm run db:generate` and commit the migration files.

## Coding standards

- **TypeScript** with strict typing. Avoid `any` where a real type is feasible.
- **Validation** at the boundary: validate all external input with the existing
  schema utilities; never trust client data.
- **Errors** use the shared error shape in `src/lib/errors.ts`. Do not leak
  secrets, stack traces, or internal identifiers in responses.
- **Style** is enforced by ESLint. Run `npm run lint` and fix warnings rather
  than disabling rules.
- Keep changes focused. Unrelated refactors belong in their own PR.

## Commit and PR conventions

- Use clear, imperative commit messages. We recommend
  [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).
- Reference the issue your PR closes (e.g. `Closes #123`).
- Fill out the pull request template, including how you tested the change.
- Keep PRs small and reviewable.
- Do not commit secrets, `.env` files, build output, or local databases.

## Review process

A maintainer will review your PR, may request changes, and will merge once CI is
green and the change is approved. Be responsive to review feedback; stale PRs
may be closed and can always be reopened.

## Licensing of contributions

Passify is released under the [Functional Source License](./LICENSE.md)
(FSL-1.1-Apache-2.0). By submitting a contribution you agree that it is licensed
under the same terms and that you have the right to submit it.

## Security

Do not report security vulnerabilities through public issues or pull requests.
Follow the process in [`SECURITY.md`](./SECURITY.md).
