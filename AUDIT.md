# Pre-submission Audit Checklist — Granny Recovery Tracker

This checklist prepares the project for Hacktoberfest and DEV weekend challenge submission.

## Repository basics
- [ ] Public repository on GitHub
- [ ] LICENSE present (MIT/Apache recommended) — see LICENSE
- [ ] README explains project, tech stack, and setup — see README.md
- [ ] CONTRIBUTING.md with contribution steps and issue labels — see CONTRIBUTING.md
- [ ] CODE_OF_CONDUCT.md present
- [ ] .gitignore present
- [ ] At least one `good first issue` or `hacktoberfest`-eligible issue open

## Technical & deployment
- [ ] Backend has a health check endpoint (GET /health)
- [ ] Basic authentication implementation (JWT) or placeholder with TODOs
- [ ] Database migrations or instructions provided (eg. using Alembic)
- [ ] Dev environment instructions in backend/README.md and frontend/README.md
- [ ] CI configured to run tests (GitHub Actions placeholder in .github/workflows)

## AI, privacy & security
- [ ] Use an open-weight model and document how to run it locally (Ollama + Gemma)
- [ ] Do not include any personal health data in the repo or examples
- [ ] Document data retention & privacy expectations in README or a PRIVACY.md (if needed)

## Submission & DEV article
- [ ] Prepare a short writeup for DEV following the challenge template (title, summary, tech, link to demo + repo, how it supports caregivers)

## Optional (recommended)
- [ ] Add CODEOWNERS or maintainer contact
- [ ] Provide a tiny seeded dataset (anonymized) for testing UI

If you want, I can create the `good first issue` examples and open issue templates next.
