# AI Travel Planner

A clean, responsive single-page website for TravelMind — an AI-powered travel planner.

## Project files

- `index.html` — main web page with landing, loading, suggestions, results, and history screens.
- `styles.css` — modern UI styling and responsive layout.
- `script.js` — interactive wizard, itinerary generation, localStorage persistence, history, PDF export, and map view.

## How to run

Open `index.html` in a browser, or serve the folder with a static web server for full map tile loading and shareable links.

For the React app in `app/`, use:

- `npm run dev` for the backend API flow via the Vite dev proxy
- `npm run prod` for the production-mode API flow

## Notes

- Extended wizard uses OpenStreetMap search for location autocomplete.
- Itinerary generation runs in `api` mode by default. You can override the mode with `VITE_ITINERARY_MODE=mock` when you want the local frontend fallback.
- The dev server proxies `/api` calls to `http://localhost:3001`.
- `VITE_API_URL` can be used to point the frontend at a different backend base URL.
- Saved trips and active itinerary are persisted in browser `localStorage`.
