# MyPortfolio

A full-stack portfolio platform backend with PostgreSQL and a minimal React API test harness.

## Stack

- FastAPI + SQLAlchemy async + PostgreSQL
- Google OAuth2 auth flow
- JWT bearer auth
- Local uploads in /backend/uploads
- React + Vite test harness for manual API verification

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL running locally or via Docker
- Google OAuth project credentials

## Backend setup

1. Open a terminal in the project root.
2. Create and activate a virtual environment:
   - Windows: .venv\Scripts\activate
3. Install dependencies:
   - cd backend
   - pip install -r requirements.txt
4. Copy the sample env file and configure values:
   - copy .env.example .env
   - update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
5. Start PostgreSQL via Docker:
   - docker-compose up -d
6. Run the API:
   - uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

## Google OAuth setup

1. Go to https://console.cloud.google.com/
2. Create a project and enable Google Identity / OAuth.
3. Configure an OAuth client ID for a web app.
4. Add authorized redirect URI:
   - http://localhost:8000/api/auth/google/callback
5. Set the values in backend/.env:
   - GOOGLE_CLIENT_ID=...
   - GOOGLE_CLIENT_SECRET=...

## Email/password authentication flow

The backend now supports both Google OAuth and local email/password auth.

### Sign up

- POST http://localhost:8000/api/signup
- Body: {"email": "user@example.com", "password": "Secure123"}
- Passwords must be at least 8 characters, include at least one letter and one digit.
- The API returns 201 and creates a user with `email_verified=true`.

### Login

- POST http://localhost:8000/api/login
- Body: {"email": "user@example.com", "password": "Secure123"}
- Response includes a JWT bearer token.

### Protected account actions

- POST /api/change-password
- PUT /api/change-email
- DELETE /api/account

The frontend test harness exposes these forms on the landing page and dashboard.

## Frontend test harness setup

1. From the project root:
   - cd frontend-test
   - npm install
2. Start Vite:
   - npm run dev
3. Open the local URL shown by Vite.
4. Use the landing page to sign up/login with email/password or click Sign Up with Google.
5. Once authenticated, visit /dashboard to update the password, change the email, and delete the account.
6. Use the dashboard to exercise each API endpoint manually.

## Seed data

A helper script is included to create sample records quickly.

1. Run:
   - python scripts/seed_data.py
2. The script creates:
   - one sample user
   - portfolio content
   - projects and blog posts
   - money entries and credits

## API routes

Protected endpoints require a Bearer token. The frontend stores the JWT in localStorage.

## Notes

- Local uploads are served from /uploads.
- The frontend is intentionally plain and unstyled to keep it easy to test every endpoint.
- This is a test harness; the polished user-facing frontend will be built later.
