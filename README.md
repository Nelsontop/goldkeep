# 攒金金 Goldkeep

Personal gold asset tracker. Track physical gold holdings (jewelry and gold bars), view daily gold price trends, and monitor holding values at a glance.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Recharts
- **Backend**: FastAPI + SQLAlchemy (SQLite)
- **Deploy**: Docker Compose

## Quick Start

```bash
docker compose up -d
```

The app runs at `http://localhost` (frontend on :80, backend API on :8000).

### Development

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
├── frontend/         # React SPA
│   └── src/
│       ├── api/      # API client and types
│       ├── components/
│       └── pages/
├── backend/          # FastAPI server
│   └── app/
│       ├── models.py
│       ├── schemas.py
│       └── routers/
├── docker-compose.yml
└── CONTEXT.md        # Domain language glossary
```
