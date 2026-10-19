# Genrify frontend

React and TypeScript interface for the existing `backend/app` API.

## Run locally

Use the Python environment from the backend workshop and Node.js 20.19+ or 22.12+.
In one terminal, from the repository root:

```sh
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

In a second terminal:

```sh
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` for the copy step.
Open http://localhost:5173. `/api` forwards to the existing backend on port 8000.

## Workshop

Search `src/` for `BLANK 01` through `BLANK 10`. Replace each entire marked temporary expression with your answer. The starter compiles with temporary values, but the controls and readout become correct as you complete the blanks.

The interface has five main sliders and ten additional inputs. The current backend returns a fixed mock response: Pop, 50%. Moving a slider updates the form and feature radar; changing genre scores requires a later backend update.

`npm run build` checks types and builds the frontend. The development proxy is local only; deployment will need its own API routing.
