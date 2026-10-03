# Granny Recovery Tracker

A privacy-first caregiver dashboard for tracking recovery progress after a stroke or major health event.

Granny Recovery Tracker helps families and caregivers log daily recovery observations, review trends over time, and get a quick AI-assisted summary without turning the app into a medical diagnostic tool. The goal is to make daily care more structured, more visible, and easier to share.

This project was built as a Hacktoberfest-ready MVP for the DEV Weekend Challenge.

## Why this project matters

Recovery is often measured in small daily details: mobility, speech clarity, exercise consistency, medication adherence, blood pressure, and notes from the day. Those details can be hard to track in a notebook, chat thread, or spreadsheet.

Granny Recovery Tracker gives families a simple place to:

- log daily observations
- compare mobility and speech changes over time
- track whether exercises were completed
- record medication and blood pressure notes
- review patient history in one place
- generate a concise AI-assisted recovery summary

## Important note

This project is intended for caregiver support and education only. It is not a substitute for medical advice, diagnosis, or treatment.

## Features

- daily observation logging for mobility, speech, blood pressure, exercise completion, medication, and notes
- dashboard summary cards for quick recovery overview
- patient detail view and observation timeline
- AI-assisted summary with graceful fallback logic if Ollama is unavailable
- caregiver login and secure password hashing
- local SQLite storage for quick MVP development and testing
- responsive dashboard UI for desktop and tablet use

## Tech stack

- Frontend: React + Vite
- Backend: Python + FastAPI
- Database: SQLite for the local MVP
- Authentication: JWT and password hashing
- AI summary: Ollama with fallback summary generation
- Visualization: charting for recovery trends

## Demo credentials

For local testing:

- Email: caregiver@example.com
- Password: password123

## Project structure

```text
granny-recovery-tracker/
├── backend/
│   ├── app/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   └── package.json
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE
├── AUDIT.md
├── .gitignore
└──
```

## Quick start

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd granny-recovery-tracker
```

### 2. Start the backend

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will run at:

- http://localhost:8000
- health check: http://localhost:8000/health

### 3. Start the frontend

```bash
cd ../frontend
npm install
npm run dev
```

The dashboard will run at:

- http://localhost:5173

## Local app flow

1. Log in with the demo caregiver account.
2. Review the dashboard summary.
3. Add daily observations for mobility, speech, medication, and notes.
4. Inspect the patient history and trend data.
5. Use the AI summary to see a quick overview of recovery progress.

## Why this fits the challenge

This project is a strong fit for a weekend challenge because it is:

- useful for a real audience
- easy to explain in a short write-up
- clearly scoped as an MVP
- realistic and practical
- built around a meaningful product and engineering decision

It creates room for future improvements such as:

- richer analytics and reporting
- PostgreSQL migration
- better caregiver workflows
- stronger privacy and deployment hardening

## Contributing

We welcome contributors, especially for:

- UI polish and accessibility
- better charting and reporting
- additional patient metrics and filtering
- authentication improvements
- PostgreSQL migration and deployment hardening

Please see [CONTRIBUTING.md](CONTRIBUTING.md) and [AUDIT.md](AUDIT.md) for project guidelines and challenge-prep notes.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
