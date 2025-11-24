Deploy link (https://ai-life-companion-unified-daily-assistant.onrender.com/index.html)


# AI For Everyday Life

This repository contains a small full-stack app (static frontend + Express/MongoDB backend) for a personal AI assistant.

Quick local setup

1. Backend

- Copy the example env and set real values:

```powershell
cd backend
copy .env.example .env
# Edit .env and fill MONGO_URI and JWT_SECRET
notepad .env
```

- Install and start the backend:

```powershell
cd backend
npm install
npm start
```

The server serves the frontend statically and listens on `PORT` (default 3000).

2. Frontend

- The frontend is static and served by the backend. Open `http://localhost:3000` (or the value of `PORT`) in your browser.

Environment variables

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret used to sign JWT tokens
- `PORT` - server port
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` - optional Spotify API credentials

Deployment notes

- The backend serves the frontend from the project root. Deploy the `backend` folder as a Node process and ensure the project files remain together.
- Recommended hosts: Render (web service), Railway, Fly.io, or Heroku-like platforms that accept a Node server.

Render example

- Create a new Web Service on Render, link your GitHub repo, and set the following in Environment:
  - Build command: `cd backend && npm install`
  - Start command: `cd backend && npm start`
  - Set environment variables in the dashboard (MONGO_URI, JWT_SECRET, etc.)

Heroku example

- If using Heroku, add a `Procfile` in the root with:

```
web: cd backend && npm start
```

- Push to Heroku and set config vars via `heroku config:set`.

Security

- Never commit `.env` or secrets. Use `backend/.env.example` as a template.

Troubleshooting

- If you get `401 Unauthorized` from APIs, ensure you're sending a valid `Authorization: Bearer <token>` header (the frontend stores tokens in `localStorage` under `authToken`).
- If charts or other client features error, open the browser console to see stack traces.

If you want, I can:
- Add a `Procfile` and a simple deployment workflow for a specific host (Heroku/Render).
- Prepare a production `npm run build` step for the frontend (currently static files are in the repo).

Tell me which platform you want to deploy to and I will add platform-specific files and commands.
