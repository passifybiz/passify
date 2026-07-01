<!--
Thanks for contributing to Passify. Please fill out the sections below.
Keep PRs focused and small where possible. See CONTRIBUTING.md.
-->

## Summary

<!-- What does this change do, and why? -->

## Related issues

<!-- e.g. Closes #123. If there is no issue, briefly justify the change. -->

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that changes existing behavior)
- [ ] Documentation
- [ ] Chore / tooling / CI

## How was this tested?

<!-- Commands run, scenarios covered, and any manual verification. -->

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Checklist

- [ ] My change follows the project's coding standards.
- [ ] I added or updated tests for my change.
- [ ] `lint`, `typecheck`, `test`, and `build` pass locally.
- [ ] I updated documentation where relevant (README, SDK, `openapi.yaml`).
- [ ] If the API changed, I regenerated `openapi.yaml` (`npm run openapi:gen`).
- [ ] If the schema changed, I generated and committed a migration.
- [ ] I did not commit secrets, `.env` files, build output, or local databases.
