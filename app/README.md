# AI Travel Planner

A clean, responsive single-page website for TravelMind — an AI-powered travel planner.

## Project files

- `index.html` — main web page with landing, loading, suggestions, results, and history screens.
- `styles.css` — modern UI styling and responsive layout.
- `script.js` — interactive wizard, itinerary generation, localStorage persistence, history, PDF export, and map view.

## How to run

Open `index.html` in a browser, or serve the folder with a static web server for full map tile loading and shareable links.

For the React app in `app/`, use:

- `npm run dev` for the mock/local itinerary flow
- `npm run prod` for the production-mode API flow

## Notes

- Extended wizard uses OpenStreetMap search for location autocomplete.
- Itinerary generation runs in `mock` mode by default in development and `api` mode by default in production.
- You can override the mode with `VITE_ITINERARY_MODE=mock` or `VITE_ITINERARY_MODE=api`.
- The API mode uses `VITE_API_URL` for the backend base URL.
- Saved trips and active itinerary are persisted in browser `localStorage`.
