# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Releases are cut as Git tags (`vMAJOR.MINOR.PATCH`) with matching GitHub
Releases. Until the first tagged release, changes are tracked under
**Unreleased**.

## [Unreleased]

### Added

- Open-source community health files: `LICENSE.md` (FSL-1.1-Apache-2.0),
  `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and `SUPPORT.md`.
- GitHub issue forms (bug report, feature request, configuration question),
  pull request template, `CODEOWNERS`, and Dependabot configuration.
- Continuous integration hardening: dependency review and a scheduled
  `npm audit` job; CodeQL static analysis.

### Changed

- Standardized the repository README and project documentation.

### Removed

- Internal strategy, audit, and review documents are no longer tracked in the
  public repository.

[Unreleased]: https://github.com/passifybiz/passify/commits
