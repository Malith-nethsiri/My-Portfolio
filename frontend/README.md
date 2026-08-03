# MyPortfolio Frontend

A polished React + Vite frontend for the MyPortfolio backend. It includes a branded landing page, portfolio editing experience, projects and blog pages, and a private money tracker.

## Stack

- React 19 + Vite
- Tailwind CSS
- React Router v7
- Tiptap rich text editor
- Recharts
- Responsive portfolio layouts
- Lightweight auth context with JWT handling

## Prerequisites

- Node.js 18+
- A running MyPortfolio backend on port 8000
- A configured Google OAuth client for the backend

## Setup

1. From the project root:
   - cd frontend
2. Install dependencies:
   - npm install
3. Create your env file:
   - copy .env.example .env
4. Update the API URL if needed:
   - VITE_API_URL=http://localhost:8000
5. Start the dev server:
   - npm run dev

## Backend requirements

The frontend expects:

- FastAPI backend running at http://localhost:8000
- Google OAuth callback at http://localhost:8000/api/auth/google/callback
- JWT auth attached via Bearer token in the Authorization header

## Main routes

- / : landing page
- /:username : public portfolio + edit mode when owner is authenticated
- /:username/projects : project archive
- /:username/blog : public blog timeline
- /:username/money : private money dashboard for the owner

## Notes

- The app stores the JWT in localStorage for demo usage.
- The portfolio page can enter edit mode with the ?edit=true query param when the current user owns the portfolio.
- If the backend returns 401, the app redirects the user back to the landing page.
