# Copilot Instructions (Hackathon)

## Big picture
- Two separate apps in one repo:
  - backend/: FastAPI “Skill Intelligence API” with mocked AI services. Entry point in backend/app/main.py wires routers + CORS.
  - frontend/: Next.js 14 App Router for “NyayaConnect” legal-aid demo. Uses Next API route handlers + SQLite.
- These apps are not integrated yet: frontend “Skill Intelligence” screens use mocked data in frontend/lib/api.ts, while backend exposes its own REST endpoints in backend/app/api/*.py.

## Backend architecture (FastAPI)
- Routers in backend/app/api/*.py delegate to service classes in backend/app/services/*.py.
- Request/response schemas live in backend/app/models/schemas.py and are used as FastAPI response models.
- AI logic is explicitly mocked with TODO(Gemini) markers in services; keep those placeholders when extending.
- CORS is configured in backend/app/core/config.py for http://localhost:3000.

## Frontend architecture (Next.js App Router)
- Server route handlers live in frontend/app/api/**/route.ts. They enforce auth and role checks before DB access.
- Auth is cookie-based JWT via frontend/lib/authServer.ts; client state lives in frontend/lib/auth.tsx and AuthProvider.
- Data persistence uses SQLite via better-sqlite3; schema is created on first access in frontend/lib/db.ts (data/nyayaconnect.db).
- Role-based UIs:
  - Login pages in frontend/app/login/* use components/LoginForm.tsx.
  - Dashboards in frontend/app/{client,lawyer,student}/page.tsx are protected by components/ProtectedRoute.tsx.
- Case workflows are centered around API routes in frontend/app/api/cases/** and student assignment routes in frontend/app/api/student/**.

## Project-specific patterns
- Ownership checks are enforced in route handlers (e.g., frontend/app/api/cases/[id]/route.ts); mirror this pattern for new routes.
- Case scoring is derived from description length + keyword bonuses in frontend/lib/scoring.ts.
- “Simplify legal text” is mocked in frontend/lib/simplify.ts; keep deterministic output for demos.

## Developer workflows
- Backend (FastAPI): see backend/README.md (venv + uvicorn app.main:app --reload).
- Frontend (Next.js): use npm scripts in frontend/package.json (npm run dev, build, start, lint).

## Integration points
- Frontend API routes rely on JWT cookie “nyaya_session” (frontend/lib/authServer.ts) and SQLite in frontend/data.
- Backend endpoints are isolated (resume upload, roadmap, gap analysis, interview) and currently return mocked responses.
