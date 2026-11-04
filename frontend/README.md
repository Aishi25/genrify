# Genrify frontend

React and TypeScript interface for the existing `backend/app` API.

## Run locally

Follow the repository's [root setup guide](../README.MD) first. It covers Node/npm, a fresh Python environment, both terminal commands, health checks, and recovery from broken `.venv` folders or missing React types.

Keep the API on port 8000 and Vite on port 5173 running in separate terminals. Copy `.env.example` to `.env.local` as described in the root guide; `VITE_API_URL=/api` enables the local proxy. Open http://localhost:5173.

## Workshop 6: completed radar comparison

Main includes the twelve completed answers. The [original student starter branch](https://github.com/sjayan009/genrify-workshop/tree/radar-student-starter-pack) preserves the fill-in-the-blank exercise for future workshops.

| Stage | File | What the completed code does |
| --- | --- | --- |
| Scale | `src/lib/radar.ts` | Clamp values and divide Tempo by 250 for display |
| Geometry | `src/lib/radar.ts` | Position five evenly spaced points and format SVG coordinates |
| Overlays | `src/components/GenreRadar.tsx` | Select the predicted genre's profile and draw two independent polygons |
| React connection | `src/App.tsx` | Pass the latest prediction and current slider values into the chart |

### Trace a slider change

1. A control sends the updated draft to `handleDraftChange` in App.
2. React saves the draft and recalculates the numeric `radarInputs`.
3. `GenreRadar` receives those inputs and converts the five values into its solid polygon.
4. A debounced API request sends all fifteen input fields to the backend.
5. The response supplies a genre name; the chart looks up that genre's fixed averages for its dashed polygon.

Both polygons use the same feature order and display scale. The chart displays Danceability, Energy, Acousticness, Valence, and Tempo. Ten additional model inputs remain in the form. Tempo stays in raw BPM in API requests and value labels.

### Check the completed behavior

- Moving Energy changes only the Energy vertex on the solid track polygon immediately.
- At 125 BPM, Tempo sits halfway along its spoke.
- Moving Loudness changes the form and API request without moving a radar vertex.
- `radarPoint(0, 1)` gives x = 160 and y = 52; `radarPoint(0, 0)` gives the center (160, 160).
- Polygon strings contain five x,y pairs separated by spaces.
- Setting the other four displayed values to 0.5 and Tempo to 125 makes a half-radius pentagon.

The grid, labels, styling, accessible value table, prediction requests, and precomputed genre profiles are included. Read the one-line source comments for each part's role.

### What to expect from the backend

The current student backend always returns Pop with 50% confidence. Changing sliders updates the solid track polygon immediately. The app clears the previous result during a request, so the dashed reference briefly disappears and returns when the response arrives. With this mock, it returns to the same Pop reference. This exercise does not train or replace the classifier.

The dashed polygon represents feature averages, not genre probabilities. A larger polygon does not mean a better track or higher confidence. Shape similarity alone does not explain the classifier's decision.

The supplied numbers in `src/data/genreProfiles.ts` are copied unchanged from the finished reference repository. The source CSV is not required for this exercise.

`npm run build` checks types and builds the frontend. The development proxy is local only; deployment needs its own API routing.
