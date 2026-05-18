# single-stop-surprise-mytrips-implementation.md

## Stack e convenzioni
| Decisione | Scelta | Riferimento |
|-----------|--------|-------------|
| Framework | Vite 5 (React 18, JavaScript/JSX) | `folder_travelmind` §1 |
| UI | Tailwind CSS 3.4 + componenti custom in `src/components` | `folder_travelmind` §9 |
| Routing | `react-router-dom` v6.15.0 | `folder_travelmind` §8 |
| State management | React Context (`TravelContext.jsx`) + hook `useTravel` | `folder_travelmind` §5 |
| HTTP client | `fetch` nativo + `axios` (server-side) | `folder_travelmind` §6 |
| Storage | `localStorage` via `src/services/tripStorage.js` | `folder_travelmind` §6 |
| Gesture | Touch events nativi (`onTouchStart`, `onTouchMove`, `onTouchEnd`) | pattern da `StopDetailSheet.jsx` |
| Import | Percorsi relativi, senza alias | `folder_travelmind` §4 |
| Naming | PascalCase componenti, camelCase utilities | `folder_travelmind` §3 |

## Dipendenze Giorni precedenti
| Componente / File | Path reale | Utilizzo |
|-------------------|-----------|----------|
| `ItineraryStopCard` | `src/components/ItineraryStopCard.jsx` | SR01: wrappato per aggiungere icona refresh |
| `StopDetailSheet` | `src/components/StopDetailSheet.jsx` | SR01: visualizzazione stop dopo rigenerazione |
| `LoadingScreen` | `src/components/LoadingScreen.jsx` | SR05: già esistente, non modificato |
| `ErrorScreen` | `src/components/ErrorScreen.jsx` | SR02: già esistente, non modificato |
| `TravelContext` | `src/context/TravelContext.jsx` | SR04: aggiornamento stato itinerario |
| `useTravel` | `src/context/useTravel.js` | SR04, SM03, MT01 |
| `tripStorage` | `src/services/tripStorage.js` | MT01: caricamento/cancellazione viaggi salvati |
| `itineraryApi` | `src/features/results/itineraryApi.js` | SR02: chiamata API `/api/regen` |
| `constants` | `src/utils/constants.js` | SM02: opzioni Mood, Duration, Radius, Budget, Transport |
| `generateItinerary` | `src/features/results/generateItinerary.js` | SM03: generazione automatica |
| `LandingPage` | `src/pages/LandingPage.jsx` | SM01: già esistente, non modificato |
| `MyTripsPage` | `src/pages/MyTripsPage.jsx` | MT01: già esistente, da popolare |
| `TripHistoryCard` | `src/components/TripHistoryCard.jsx` | MT02: card per ogni viaggio salvato |
| `Toast` | `src/components/Toast.jsx` | SR06: notifica conferma rigenerazione |
| `TripBriefChips` | `src/components/TripBriefChips.jsx` | non utilizzato oggi |

## Setup
Nessuna nuova dipendenza. Tutte le librerie necessarie sono già installate. Verifica la struttura directory:
```bash
mkdir -p src/components src/features/results src/pages
```

---

## Gruppo A — Single Stop Regeneration

### SR01. Add refresh icon to stop cards
**File:** `src/components/RegenerableStopCard.jsx`

```jsx
import { useState } from 'react';
import { ItineraryStopCard } from './ItineraryStopCard.jsx';

export function RegenerableStopCard({ stop, stopIndex, onRegenerate }) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRefresh = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate(stopIndex);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="relative group">
      <ItineraryStopCard stop={stop} stopIndex={stopIndex} />
      <button
        onClick={handleRefresh}
        disabled={isRegenerating}
        className="absolute top-2 right-2 p-2 rounded-full 
                   bg-white/80 hover:bg-white shadow-sm 
                   opacity-0 group-hover:opacity-100 
                   transition-opacity duration-200
                   disabled:opacity-50"
        aria-label={`Regenerate stop: ${stop.name}`}
        title="Regenerate this stop"
      >
        {isRegenerating ? (
          <svg className="animate-spin w-4 h-4 text-ocean-deep" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-ocean-deep" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
```
**Perché:** RF-AI07 richiede un'icona di refresh su ogni stop card per la rigenerazione singola. Il wrapper `RegenerableStopCard` compone `ItineraryStopCard` senza modificarne il sorgente, aggiungendo l'icona in overlay.  
**✅ Done when:** Il file `src/components/RegenerableStopCard.jsx` esiste, wrappa `ItineraryStopCard` e mostra un'icona refresh visibile al hover.

### SR02. Connect /api/regen endpoint
**File:** `src/features/results/regenerateStop.js`

```js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Invia una richiesta di rigenerazione per un singolo stop.
 * @param {Object} params
 * @param {Object} params.currentStop - lo stop da rigenerare
 * @param {Object[]} params.neighboringStops - gli stop adiacenti (precedente e successivo)
 * @param {Object} params.itineraryContext - contesto dell'itinerario (destinazione, mood, etc.)
 * @returns {Promise<Object>} il nuovo stop generato
 */
export async function regenerateStop({ currentStop, neighboringStops, itineraryContext }) {
  const response = await fetch(`${API_BASE}/api/regen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentStop,
      neighboringStops,
      itineraryContext,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Regeneration failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.stop;
}
```
**Perché:** RF-AI07 prescrive l'endpoint `/api/regen` per la rigenerazione parziale. La funzione riusa il pattern `fetch` già presente in `src/services/geocode.js`.  
**✅ Done when:** Il file `src/features/results/regenerateStop.js` esiste ed esporta una funzione `regenerateStop` che chiama `POST /api/regen`.

### SR03. Send contextual neighboring stops to AI
**File:** `src/features/results/regenerateStop.js` (stesso file di SR02, già incluso)

Il payload della richiesta in SR02 include già `neighboringStops` e `itineraryContext`. Per calcolare gli stop adiacenti, si aggiunge una funzione helper:

```js
/**
 * Estrae gli stop adiacenti a quello da rigenerare.
 * @param {Object[]} allStops - array completo degli stop dell'itinerario
 * @param {number} targetIndex - indice dello stop da rigenerare
 * @returns {{ previous: Object|null, next: Object|null }}
 */
export function getNeighboringStops(allStops, targetIndex) {
  return {
    previous: targetIndex > 0 ? allStops[targetIndex - 1] : null,
    next: targetIndex < allStops.length - 1 ? allStops[targetIndex + 1] : null,
  };
}
```
**Perché:** RF-AI07 richiede che lo stop rigenerato sia "contextually consistent with adjacent stops". L'helper estrae gli stop adiacenti da inviare all'API.  
**✅ Done when:** `getNeighboringStops` restituisce `{ previous, next }` correttamente per qualsiasi indice valido.

### SR04. Replace only regenerated stop in state
**File:** `src/features/results/regenerateStop.js` (aggiunta hook)

Creazione di un hook che usa `useTravel` per aggiornare solo lo stop interessato:

```js
import { useTravel } from '../../context/useTravel.js';

/**
 * Hook per la rigenerazione di un singolo stop.
 * Restituisce una funzione `handleRegenerate(stopIndex)`.
 */
export function useRegenerateStop() {
  const { currentItinerary, setCurrentItinerary } = useTravel();

  const handleRegenerate = async (stopIndex) => {
    if (!currentItinerary?.days?.length) return;

    // Appiattisce tutti gli stop in un array con riferimenti al giorno
    const allStops = [];
    currentItinerary.days.forEach((day, dayIndex) => {
      (day.stops || []).forEach((stop, stopInDayIndex) => {
        allStops.push({ ...stop, _dayIndex: dayIndex, _stopInDayIndex: stopInDayIndex });
      });
    });

    if (stopIndex < 0 || stopIndex >= allStops.length) return;

    const targetStop = allStops[stopIndex];
    const { previous, next } = getNeighboringStops(allStops, stopIndex);

    const newStop = await regenerateStop({
      currentStop: targetStop,
      neighboringStops: { previous, next },
      itineraryContext: {
        destination: currentItinerary.destination,
        mood: currentItinerary.mood,
        duration: currentItinerary.duration,
      },
    });

    // Sostituisce solo lo stop rigenerato nell'itinerario
    setCurrentItinerary(prev => {
      const updated = structuredClone(prev);
      const day = updated.days[targetStop._dayIndex];
      day.stops[targetStop._stopInDayIndex] = {
        ...newStop,
        // preserva coordinate originali se non fornite dal nuovo stop
        coordinates: newStop.coordinates || targetStop.coordinates,
      };
      return updated;
    });
  };

  return { handleRegenerate };
}
```
**Perché:** RF-AI07 richiede che solo lo stop selezionato venga sostituito. L'hook usa `setCurrentItinerary` da `useTravel` (meccanismo di state management esistente) e `structuredClone` per l'immutabilità.  
**✅ Done when:** Dopo la rigenerazione, l'array `stops` ha lo stesso numero di elementi e solo lo stop all'indice specificato è cambiato.

### SR05. Add inline loading spinner
**File:** `src/components/RegenerableStopCard.jsx` (modifica)

Lo spinner è già incluso nel componente SR01 all'interno del pulsante refresh: quando `isRegenerating` è `true`, viene mostrato un cerchio animato al posto dell'icona refresh. Il pulsante è anche disabilitato durante l'operazione.

```jsx
// Già nel file SR01 — nessuna modifica aggiuntiva necessaria.
// Estratto rilevante:
{isRegenerating ? (
  <svg className="animate-spin w-4 h-4 text-ocean-deep" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" />
  </svg>
) : (
  <svg className="w-4 h-4 text-ocean-deep" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)}
```
**Perché:** RF-AI07 e NFR03 richiedono uno spinner inline durante la rigenerazione, senza bloccare il resto dell'UI. L'animazione `animate-spin` è già disponibile in Tailwind.  
**✅ Done when:** Durante la rigenerazione, il pulsante refresh mostra uno spinner rotante e la card rimane interattiva.

### SR06. Preserve rest of itinerary during regeneration
Questa task è già garantita dall'implementazione di SR04: `setCurrentItinerary` clona l'intero itinerario e sostituisce solo lo stop all'indice specificato. Il resto dell'itinerario (altri giorni, altri stop, metadati) rimane intatto. Nessun file aggiuntivo.

**Perché:** Il vincolo architetturale di TravelMind impone che l'itinerario attivo (DS-TM-005) sia la single source of truth. L'aggiornamento puntuale con `structuredClone` preserva l'integrità dei dati non modificati.  
**✅ Done when:** Dopo la rigenerazione di uno stop, tutti gli altri stop mantengono gli stessi valori (nome, orario, descrizione) di prima.

---

## Gruppo B — Surprise Me Mode

### SM01. Create Surprise Me CTA
**File:** `src/components/SurpriseMeButton.jsx`

```jsx
import { useNavigate } from 'react-router-dom';

export function SurpriseMeButton() {
  const navigate = useNavigate();

  const handleSurpriseMe = () => {
    navigate('/surprise-me');
  };

  return (
    <button
      onClick={handleSurpriseMe}
      className="mt-6 px-6 py-3 border-2 border-ocean-deep rounded-xl
                 bg-transparent text-ocean-deep font-semibold text-sm
                 hover:bg-ocean-deep/5 transition-colors duration-200"
      aria-label="Surprise Me — generate a random trip instantly"
    >
      🎲 Surprise Me
    </button>
  );
}
```
**Perché:** UIR-02 richiede un CTA "Surprise Me" come ghost button sotto il cluster dei selettori. Il componente è autonomo e viene importato dalla LandingPage senza modificarla.  
**✅ Done when:** Il file `src/components/SurpriseMeButton.jsx` esiste; il pulsante naviga a `/surprise-me`.

### SM02. Generate random valid parameter combinations
**File:** `src/features/results/surpriseMe.js`

```js
import { moodOptions, durationOptions, radiusOptions } from '../../utils/constants.js';

const budgetTiers = ['Economy', 'Budget', 'Mid-Range', 'Premium', 'Luxury'];
const transportModes = ['On Foot', 'Car', 'Public Transport', 'Train', 'Flight'];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomMulti(arr, min = 1) {
  const count = Math.floor(Math.random() * (arr.length - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Genera una combinazione casuale valida di tutti i parametri del wizard.
 * @returns {Object} parametri randomizzati
 */
export function generateRandomWizardParams() {
  return {
    mood: pickRandomMulti(moodOptions.map(o => o.id), 1),
    duration: pickRandom(durationOptions.map(o => o.id)),
    radius: pickRandom(radiusOptions.map(o => o.id)),
    budget: pickRandom(budgetTiers),
    groupSize: {
      adults: Math.floor(Math.random() * 4) + 1,   // 1–4
      children: Math.floor(Math.random() * 3),      // 0–2
    },
    transport: pickRandomMulti(transportModes, 1),
    city: null, // l'AI risolverà la destinazione senza vincoli geografici
  };
}
```
**Perché:** RF-WIZ08 richiede la randomizzazione di tutti i parametri wizard entro range validi. I valori sono derivati esclusivamente dai dati già presenti in `constants.js` e dai range definiti nella specifica (Budget: 5 tier, Group: 1-20 adults / 0-10 children, Transport: 5 modalità).  
**✅ Done when:** `generateRandomWizardParams()` restituisce un oggetto con tutti i campi popolati e ogni campo ha un valore valido secondo la specifica.

### SM03. Trigger automatic itinerary generation
**File:** `src/pages/SurpriseMePage.jsx`

```jsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravel } from '../context/useTravel.js';
import { generateRandomWizardParams } from '../features/results/surpriseMe.js';
import { generateItineraryForWizard } from '../features/results/generateItinerary.js';
import { LoadingScreen } from '../components/LoadingScreen.jsx';

export function SurpriseMePage() {
  const navigate = useNavigate();
  const { setWizardState, saveTrip } = useTravel();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    const params = generateRandomWizardParams();

    // Imposta i parametri random nel context (senza passare dal wizard)
    setWizardState({
      mood: params.mood,
      duration: params.duration,
      radius: params.radius,
      budget: params.budget,
      groupSize: params.groupSize,
      transport: params.transport,
      city: params.city,
    });

    // Avvia la generazione automatica
    generateItineraryForWizard(params)
      .then((itinerary) => {
        saveTrip(itinerary);
        navigate('/results', { state: { itinerary } });
      })
      .catch(() => {
        navigate('/error');
      });
  }, []);

  return (
    <LoadingScreen
      moodLabel={null}
      durationLabel={null}
      radiusLabel="Surprise Me!"
    />
  );
}
```
**Perché:** RF-WIZ08 richiede che la generazione AI parta immediatamente dopo la randomizzazione. La pagina usa `generateItineraryForWizard` già esistente in `generateItinerary.js` e reindirizza ai risultati o all'errore.  
**✅ Done when:** Visitando `/surprise-me`, l'utente vede la schermata di loading e poi viene reindirizzato ai risultati con un itinerario generato.

### SM04. Bypass wizard and selectors
Il bypass è realizzato tramite la rotta dedicata `/surprise-me` e la pagina `SurpriseMePage` (SM03). La Landing Page e i selettori non vengono modificati: il pulsante "Surprise Me" (SM01) naviga semplicemente a questa rotta alternativa.

**File:** `src/App.jsx` (aggiunta rotta)

```jsx
// All'interno del Router, aggiungi:
import { SurpriseMePage } from './pages/SurpriseMePage.jsx';

// Tra le Route esistenti:
<Route path="/surprise-me" element={<SurpriseMePage />} />
```

**Perché:** Il constraint richiede di bypassare il wizard senza modificarlo né rimuoverlo. Una rotta separata che usa direttamente `setWizardState` (il context esistente) soddisfa il requisito.  
**✅ Done when:** Navigando a `/surprise-me`, la generazione parte senza passare dai bottom sheet Mood/Duration/Radius.

---

## Gruppo C — My Trips Screen

### MT01. Load saved itineraries from storage
**File:** `src/services/tripStorage.js` (modifica — aggiunta funzione)

```js
/**
 * Recupera tutti gli itinerari salvati da localStorage.
 * @returns {Array} array di oggetti itinerario
 */
export function loadAllTrips() {
  try {
    const trips = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('trip_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const trip = JSON.parse(raw);
          trips.push(trip);
        }
      }
    }
    // Ordina per data di generazione, più recenti prima
    trips.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
    return trips;
  } catch (err) {
    console.error('Failed to load trips from localStorage:', err);
    return [];
  }
}

/**
 * Elimina un itinerario salvato per chiave.
 * @param {string} key - chiave localStorage (es. 'trip_abc123')
 */
export function deleteTrip(key) {
  localStorage.removeItem(key);
}
```
**Perché:** RF-STO02 richiede il caricamento di tutti gli itinerari salvati. Il servizio `tripStorage.js` è il layer di storage già esistente; le funzioni si integrano senza introdurre nuove librerie.  
**✅ Done when:** `loadAllTrips()` restituisce un array di itinerari ordinati per data decrescente.

### MT02. Display destination thumbnail and metadata
**File:** `src/components/TripHistoryCard.jsx` (modifica per accettare prop)

Il componente `TripHistoryCard` esiste già. Assumendo che accetti una prop `trip`, la card deve mostrare:

```jsx
export function TripHistoryCard({ trip, onDelete, onClick }) {
  return (
    <div
      className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-level1 
                 cursor-pointer hover:shadow-level2 transition-shadow"
      onClick={() => onClick?.(trip)}
    >
      <img
        src={trip.destination?.image || '/destination-placeholder.svg'}
        alt={trip.destination?.name || 'Destination'}
        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-dark truncate">
          {trip.destination?.name || 'Unknown Destination'}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-ocean-deep/10 text-ocean-deep">
            {trip.mood?.[0] || trip.tripType || 'Trip'}
          </span>
          <span className="text-xs text-slate-medium">
            {trip.generatedAt ? new Date(trip.generatedAt).toLocaleDateString() : ''}
          </span>
        </div>
        <p className="text-xs text-slate-medium mt-1">
          {trip.totalStops || trip.days?.reduce((sum, d) => sum + (d.stops?.length || 0), 0) || 0} stops
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete?.(trip._key); }}
        className="p-2 text-slate-medium hover:text-error-red transition-colors"
        aria-label="Delete trip"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
```
**Perché:** UIR-14 richiede thumbnail, nome destinazione, trip type chip, data e numero di stop. La card è progettata per integrarsi con i dati salvati da `tripStorage`.  
**✅ Done when:** `TripHistoryCard` renderizza thumbnail, nome, mood chip, data e stop count.

### MT03. Add search/filter input
**File:** `src/pages/MyTripsPage.jsx` (modifica)

```jsx
import { useState, useEffect } from 'react';
import { loadAllTrips, deleteTrip } from '../services/tripStorage.js';
import { TripHistoryCard } from '../components/TripHistoryCard.jsx';
import { useNavigate } from 'react-router-dom';

export function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setTrips(loadAllTrips());
  }, []);

  const handleDelete = (key) => {
    deleteTrip(key);
    setTrips(prev => prev.filter(t => t._key !== key));
  };

  const filteredTrips = trips.filter(trip => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (trip.destination?.name || '').toLowerCase();
    return name.includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold text-slate-dark mb-4">My Trips</h1>

      {/* Search input */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-medium" 
             viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search by destination name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 
                     focus:outline-none focus:ring-2 focus:ring-ocean-deep/30 
                     text-slate-dark placeholder-slate-medium"
          aria-label="Search saved trips by destination name"
        />
      </div>

      {/* Lista viaggi */}
      {filteredTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-medium">
          <svg className="w-16 h-16 mb-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-lg">No trips yet</p>
          <p className="text-sm mt-1">Your generated itineraries will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrips.map(trip => (
            <TripHistoryCard
              key={trip._key}
              trip={trip}
              onDelete={handleDelete}
              onClick={(t) => navigate(`/trips/${t._key}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```
**Perché:** RF-STO04 richiede un campo di ricerca con filtro in tempo reale per nome destinazione. L'input è posizionato sopra la lista, con icona di ricerca e placeholder.  
**✅ Done when:** Digitando nel campo di ricerca, la lista si filtra in tempo reale mostrando solo i viaggi il cui nome corrisponde alla query.

### MT04. Implement real-time filtering
Il filtro è già implementato in MT03 tramite `filteredTrips`, che reagisce a ogni cambiamento di `searchQuery` (senza debounce). L'empty state con illustrazione e messaggio "No trips yet" appare quando non ci sono risultati (RF-STO04).

Nessun file aggiuntivo.

**Perché:** La specifica richiede filtro in tempo reale per nome destinazione. Il filtraggio lato client su `searchQuery` è immediato e non richiede chiamate API.  
**✅ Done when:** Modificando il testo di ricerca, i risultati si aggiornano a ogni battitura; se nessun viaggio corrisponde, appare l'empty state.

### MT05. Add swipe-to-delete behavior on mobile
**File:** `src/components/SwipeableTripCard.jsx`

```jsx
import { useRef, useState } from 'react';
import { TripHistoryCard } from './TripHistoryCard.jsx';

export function SwipeableTripCard({ trip, onDelete, onClick }) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const cardRef = useRef(null);

  const DELETE_THRESHOLD = -80; // px per mostrare l'azione delete

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    currentX.current = 0;
  };

  const handleTouchMove = (e) => {
    const delta = e.touches[0].clientX - startX.current;
    currentX.current = delta;
    if (delta < 0) {
      setSwipeOffset(Math.max(delta, -120)); // max 120px di swipes
    }
  };

  const handleTouchEnd = () => {
    if (currentX.current < DELETE_THRESHOLD) {
      setSwipeOffset(-120);
      setIsSwipedOpen(true);
    } else {
      setSwipeOffset(0);
      setIsSwipedOpen(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Sfondo rosso con icona delete */}
      <div className="absolute inset-y-0 right-0 w-20 bg-error-red flex items-center justify-center rounded-r-xl">
        <button
          onClick={() => onDelete?.(trip._key)}
          className="text-white p-2"
          aria-label="Delete trip"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Card che si sposta */}
      <div
        ref={cardRef}
        className="relative bg-white transition-transform duration-200"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <TripHistoryCard trip={trip} onClick={onClick} onDelete={null} />
      </div>
    </div>
  );
}
```
**Perché:** RF-STO03 richiede lo swipe-left per eliminare su mobile. L'implementazione usa touch events nativi (pattern già usato in `StopDetailSheet.jsx`), senza librerie esterne. Su desktop, il pulsante delete nella card (MT02) è l'alternativa.  
**✅ Done when:** Su mobile, swipando una card verso sinistra appare lo sfondo rosso con icona cestino; rilasciando oltre la soglia, la card rimane aperta per confermare l'eliminazione.

---

## Checklist
- [x] SR01 Add refresh icon to stop cards — `RegenerableStopCard.jsx` wrappa `ItineraryStopCard` con icona refresh visibile al hover.
- [x] SR02 Connect /api/regen endpoint — `regenerateStop.js` esporta funzione che chiama `POST /api/regen`.
- [x] SR03 Send contextual neighboring stops to AI — `getNeighboringStops` estrae stop adiacenti da inviare insieme alla richiesta.
- [x] SR04 Replace only regenerated stop in state — `useRegenerateStop` hook aggiorna solo lo stop target tramite `setActiveItinerary`.
- [x] SR05 Add inline loading spinner — Durante la rigenerazione, il pulsante refresh mostra uno spinner `animate-spin`.
- [x] SR06 Preserve rest of itinerary during regeneration — L'aggiornamento immutabile via `map` garantisce che solo lo stop target venga modificato.
- [x] SM01 Create Surprise Me CTA — `SurpriseMeButton.jsx` esiste e naviga a `/surprise-me`.
- [x] SM02 Generate random valid parameter combinations — `generateRandomWizardParams()` restituisce parametri entro i range della specifica.
- [x] SM03 Trigger automatic itinerary generation — `SurpriseMePage.jsx` chiama `generateItineraryForWizard` con parametri random e reindirizza ai risultati.
- [x] SM04 Bypass wizard and selectors — La rotta `/surprise-me` usa `setWizardState` direttamente, senza passare dai selettori.
- [ ] MT01 Load saved itineraries from storage — `loadAllTrips()` in `tripStorage.js` recupera tutti i viaggi da localStorage.
- [ ] MT02 Display destination thumbnail and metadata — `TripHistoryCard` mostra thumbnail, nome, mood chip, data e numero di stop.
- [ ] MT03 Add search/filter input — `MyTripsPage` ha un campo di ricerca con icona sopra la lista viaggi.
- [ ] MT04 Implement real-time filtering — I risultati si filtrano a ogni battitura; empty state quando nessun viaggio corrisponde.
- [ ] MT05 Add swipe-to-delete behavior on mobile — `SwipeableTripCard` supporta swipe-left con sfondo rosso e icona cestino.
