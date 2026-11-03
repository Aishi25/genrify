# Genrify frontend

React and TypeScript interface for the existing `backend/app` API.

## Run locally

Follow the repository's [root setup guide](../README.MD) first. It covers Node/npm, a fresh Python environment, both terminal commands, health checks, and recovery from broken `.venv` folders or missing React types.

Keep the API on port 8000 and Vite on port 5173 running in separate terminals. Copy `.env.example` to `.env.local` as described in the root guide; `VITE_API_URL=/api` enables the local proxy. Open http://localhost:5173.

## Workshop 6: the radar comparison

Complete `RADAR 01` through `RADAR 12` in these existing files:

| Stage | Blanks | File | Goal |
| --- | --- | --- | --- |
| Scale | 01–02 | `src/lib/radar.ts` | Clamp values and normalize Tempo |
| Geometry | 03–07 | `src/lib/radar.ts` | Position five points and build SVG coordinates |
| Overlays | 08–10 | `src/components/GenreRadar.tsx` | Select a genre profile and draw both polygons |
| React connection | 11–12 | `src/App.tsx` | Connect the prediction and current slider values |

Each marker has a temporary expression so TypeScript can compile before the exercise is finished. Replace the marker and that expression with your answer. A successful build alone does not prove the answers are correct.

Use this order. After 01–07, the grid should have five evenly spaced spokes. After 08–10 and 11–12, moving Energy should move only its vertex on the solid track polygon. Both polygons must use the same feature order and scale. The dashed reference must use the selected genre's supplied values, never the current track values.

Sanity checks: 125 BPM is halfway along the Tempo axis. For `radarPoint(0, 1)`, expect x = 160 and y = 52. For `radarPoint(0, 0)`, expect the center (160, 160). Five x,y pairs must have spaces between them.

The controls, SVG grid and labels, styling, accessibility table, prediction requests, and precomputed genre profiles are supplied. The chart displays Danceability, Energy, Acousticness, Valence, and Tempo. Ten additional model inputs remain in the form.

### What to expect from the backend

The current student backend always returns Pop with 50% confidence. Changing sliders changes the solid track polygon immediately once the blanks are complete. The app clears the previous result during a request, so the dashed reference briefly disappears and returns when the response arrives. With this mock, it returns to the same Pop reference. This exercise does not train or replace the classifier.

The dashed polygon represents feature averages, not genre probabilities. A larger polygon does not mean a better track or higher confidence. Shape similarity alone does not explain the classifier's decision.

The supplied numbers in `src/data/genreProfiles.ts` are copied unchanged from the finished reference repository. The source CSV is not required for this exercise.

`npm run build` checks types and builds the frontend. The development proxy is local only; deployment needs its own API routing.
