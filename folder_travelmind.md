Ran command: `find . -type f | grep -v node_modules | grep -v .git | sort`
Ran command: `cat ./app/package.json`
Viewed BottomSheet.jsx:1-63
Viewed LandingPage.jsx:1-800
Viewed vite.config.js:1-10
Viewed TravelContext.jsx:1-119
Viewed itinerary.js:1-122
Viewed geocode.js:1-21

## 1. Stack
- **Framework:** Vite 5 (React)  
- **Language:** JavaScript (JSX)  
- **Key libraries**
  - UI: React 18, react‑leaflet 1.9, Tailwind CSS 3.4, custom components in `src/components`
  - Routing: react‑router‑dom 6.15
  - State management: React Context (`TravelContext.jsx`) + custom hook `useTravel`
  - Animation / gestures: Tailwind utilities, CSS transitions
  - HTTP: native `fetch` (and axios for LLM calls)  

## 2. Directory tree
```
./.DS_Store
./LICENSE
./README.md
./Tasks.xlsx
./app/.env.development.example
./app/.env.production.example
./app/.prettierrc.json
./app/README.md
./app/eslint.config.js
./app/index.html
./app/package-lock.json
./app/package.json
./app/postcss.config.js
./app/public/destination-placeholder.svg
./app/script.js
./app/src/App.jsx
./app/src/App_temp.jsx
./app/src/components/ArrivalTimeDisplay.jsx
./app/src/components/BottomSheet.jsx
./app/src/components/CategoryChip.jsx
./app/src/components/DayCardAccordion.jsx
./app/src/components/DeleteTripModal.jsx
./app/src/components/DestinationHeader.jsx
./app/src/components/DurationPill.jsx
./app/src/components/ErrorScreen.css
./app/src/components/ErrorScreen.jsx
./app/src/components/ExtendedWizard.jsx
./app/src/components/ItineraryList.jsx
./app/src/components/ItineraryStopCard.jsx
./app/src/components/Layout.jsx
./app/src/components/LoadingScreen.css
./app/src/components/LoadingScreen.jsx
./app/src/components/MapView.jsx
./app/src/components/Navigation.jsx
./app/src/components/StopDetailSheet.css
./app/src/components/StopDetailSheet.jsx
./app/src/components/SuggestionCard.jsx
./app/src/components/Toast.jsx
./app/src/components/TravelNote.jsx
./app/src/components/TripBriefChips.jsx
./app/src/components/TripChip.css
./app/src/components/TripChip.jsx
./app/src/components/TripDetailShell.jsx
./app/src/components/TripHistoryCard.jsx
./app/src/components/map/MapView.css
./app/src/components/map/MapView.jsx
./app/src/components/map/RecenterControl.js
./app/src/config/runtime.js
./app/src/context/TravelContext.jsx
./app/src/context/travelContext.js
./app/src/context/useTravel.js
./app/src/features/results/generateItinerary.js
./app/src/features/results/image.js
./app/src/features/results/itineraryApi.js
./app/src/features/results/itineraryNormalizer.js
./app/src/index.css
./app/src/main.jsx
./app/src/pages/LandingPage.jsx
./app/src/pages/MyTripsPage.jsx
./app/src/pages/ResultsPage.jsx
./app/src/pages/TripDetailPage.jsx
./app/src/services/geocode.js
./app/src/services/itinerary.js
./app/src/services/pdf.js
./app/src/services/promptBuilder.js
./app/src/services/share.js
./app/src/services/tripStorage.js
./app/src/utils/constants.js
./app/styles.css
./app/tailwind.config.js
./app/vite.config.js
./requirements/TravelMind_Requirements_final_2.pdf
./requirements/extract_requirements.py
./requirements/requirements_text.txt
./server/.dockerignore
./server/.env.example
./server/Dockerfile
./server/README.md
./server/docker-compose.yml
./server/package-lock.json
./server/package.json
./server/schemaValidator.js
./server/server.js
./server/src/app.js
./server/src/config/cors.js
./server/src/config/env.js
./server/src/config/logger.js
./server/src/config/rateLimit.js
./server/src/controllers/ai.controller.js
./server/src/controllers/health.controller.js
./server/src/controllers/itinerary.controller.js
./server/src/middleware/circuitBreaker.middleware.js
./server/src/middleware/error.middleware.js
./server/src/middleware/rateLimit.middleware.js
./server/src/middleware/requestLogger.middleware.js
./server/src/middleware/validation.middleware.js
./server/src/prompts/builders/promptBuilder.js
./server/src/prompts/templates/destination.prompt.js
./server/src/prompts/templates/itinerary.prompt.js
./server/src/prompts/templates/regenerateStop.prompt.js
./server/src/providers/llm/anthropic.provider.js
./server/src/providers/llm/base.provider.js
./server/src/providers/llm/deepseek.provider.js
./server/src/providers/llm/gemini.provider.js
./server/src/providers/llm/mock.provider.js
./server/src/providers/llm/mockData.js
./server/src/providers/llm/openai.provider.js
./server/src/providers/llm/openrouter.provider.js
./server/src/providers/llmProviderFactory.js
./server/src/routes/ai.routes.js
./server/src/routes/health.routes.js
./server/src/routes/itinerary.routes.js
./server/src/server.js
./server/src/services/ai/ai.service.js
./server/src/utils/AppError.js
./server/src/utils/createApiResponse.js
./server/src/utils/retry.js
./server/src/validators/enhancedSchemaValidator.js
./server/src/validators/requestSchemas.js
./test-api.sh
./~$Tasks.xlsx
```

## 3. Naming conventions
- **Folder names:** kebab‑case (`src/components`, `src/pages`, `src/services`)  
- **File names:** PascalCase for React components (`BottomSheet.jsx`), camelCase for utilities (`utils/constants.js`)  
- **Component names:** PascalCase (`BottomSheet`, `LandingPage`)  
- **Barrel files:** No `index.ts`/`index.js` barrels are used; imports reference the component file directly.

## 4. Import convention
- **Path alias:** None – only relative paths are used.  
- **Example import (from `LandingPage.jsx`):**  
  ```js
  import { BottomSheet } from '../components/BottomSheet.jsx';
  ```

## 5. State management
- **Mechanism:** React Context (`TravelContext.jsx`) with a custom hook `useTravel` (`src/context/useTravel.js`).  
- **Example read/write (from `LandingPage.jsx`):**  
  ```js
  const { wizardState, setWizardState, saveTrip } = useTravel();

  // update wizard state
  setWizardState(prev => ({ ...prev, mood: newMoods }));
  // save generated itinerary
  saveTrip(itinerary);
  ```

## 6. API / data layer
- **Location:** Service files under `src/services` (`itinerary.js`, `geocode.js`, `tripStorage.js`).  
- **Fetch mechanism:** Native `fetch` (used in `geocode.js` and LLM providers) and `axios` (used in server‑side LLM providers).  
- **Base fetch utility path:** `src/services/geocode.js` (contains `fetchLocationAutocomplete` and `reverseGeocode`).  

## 7. Styling system
- **System:** Tailwind CSS (configured in `tailwind.config.js`) plus occasional plain CSS modules (`*.css`).  
- **Design tokens:** Defined in `src/utils/constants.js` and Tailwind theme extensions (e.g., `ocean-deep`, `sunset-gold`, `forest-trail`).  
  - Example token names: `ocean-deep`, `sunset-gold`, `forest-trail`.  

## 8. Routing
- **Router:** `react-router-dom` v6.15.0.  
- **Navigation example (from `LandingPage.jsx`):**  
  ```js
  const navigate = useNavigate();
  navigate('/results');
  ```

## 9. Existing components — quick reference
| Component | File path | What it does (≤ 8 words) |
|-----------|-----------|--------------------------

## 1. Stack
- **Framework:** Vite 5 (React)  
- **Language:** JavaScript (JSX)  
- **Key libraries**
  - UI: React 18, react‑leaflet 1.9, Tailwind CSS 3.4, custom components in `src/components`
  - Routing: react‑router‑dom 6.15
  - State management: React Context (`TravelContext.jsx`) + custom hook `useTravel`
  - HTTP: native `fetch` (and axios in server‑side LLM providers)

## 2. Directory tree
```
./.DS_Store
./LICENSE
./README.md
./Tasks.xlsx
./app/.env.development.example
./app/.env.production.example
./app/.prettierrc.json
./app/README.md
./app/eslint.config.js
./app/index.html
./app/package-lock.json
./app/package.json
./app/postcss.config.js
./app/public/destination-placeholder.svg
./app/script.js
./app/src/App.jsx
./app/src/App_temp.jsx
./app/src/components/ArrivalTimeDisplay.jsx
./app/src/components/BottomSheet.jsx
./app/src/components/CategoryChip.jsx
./app/src/components/DayCardAccordion.jsx
./app/src/components/DeleteTripModal.jsx
./app/src/components/DestinationHeader.jsx
./app/src/components/DurationPill.jsx
./app/src/components/ErrorScreen.css
./app/src/components/ErrorScreen.jsx
./app/src/components/ExtendedWizard.jsx
./app/src/components/ItineraryList.jsx
./app/src/components/ItineraryStopCard.jsx
./app/src/components/Layout.jsx
./app/src/components/LoadingScreen.css
./app/src/components/LoadingScreen.jsx
./app/src/components/MapView.jsx
./app/src/components/Navigation.jsx
./app/src/components/StopDetailSheet.css
./app/src/components/StopDetailSheet.jsx
./app/src/components/SuggestionCard.jsx
./app/src/components/Toast.jsx
./app/src/components/TravelNote.jsx
./app/src/components/TripBriefChips.jsx
./app/src/components/TripChip.css
./app/src/components/TripChip.jsx
./app/src/components/TripDetailShell.jsx
./app/src/components/TripHistoryCard.jsx
./app/src/components/map/MapView.css
./app/src/components/map/MapView.jsx
./app/src/components/map/RecenterControl.js
./app/src/config/runtime.js
./app/src/context/TravelContext.jsx
./app/src/context/travelContext.js
./app/src/context/useTravel.js
./app/src/features/results/generateItinerary.js
./app/src/features/results/image.js
./app/src/features/results/itineraryApi.js
./app/src/features/results/itineraryNormalizer.js
./app/src/index.css
./app/src/main.jsx
./app/src/pages/LandingPage.jsx
./app/src/pages/MyTripsPage.jsx
./app/src/pages/ResultsPage.jsx
./app/src/pages/TripDetailPage.jsx
./app/src/services/geocode.js
./app/src/services/itinerary.js
./app/src/services/pdf.js
./app/src/services/promptBuilder.js
./app/src/services/share.js
./app/src/services/tripStorage.js
./app/src/utils/constants.js
./app/styles.css
./app/tailwind.config.js
./app/vite.config.js
./requirements/TravelMind_Requirements_final_2.pdf
./requirements/extract_requirements.py
./requirements/requirements_text.txt
./server/.dockerignore
./server/.env.example
./server/Dockerfile
./server/README.md
./server/docker-compose.yml
./server/package-lock.json
./server/package.json
./server/schemaValidator.js
./server/server.js
./server/src/app.js
./server/src/config/cors.js
./server/src/config/env.js
./server/src/config/logger.js
./server/src/config/rateLimit.js
./server/src/controllers/ai.controller.js
./server/src/controllers/health.controller.js
./server/src/controllers/itinerary.controller.js
./server/src/middleware/circuitBreaker.middleware.js
./server/src/middleware/error.middleware.js
./server/src/middleware/rateLimit.middleware.js
./server/src/middleware/requestLogger.middleware.js
./server/src/middleware/validation.middleware.js
./server/src/prompts/builders/promptBuilder.js
./server/src/prompts/templates/destination.prompt.js
./server/src/prompts/templates/itinerary.prompt.js
./server/src/prompts/templates/regenerateStop.prompt.js
./server/src/providers/llm/anthropic.provider.js
./server/src/providers/llm/base.provider.js
./server/src/providers/llm/deepseek.provider.js
./server/src/providers/llm/gemini.provider.js
./server/src/providers/llm/mock.provider.js
./server/src/providers/llm/mockData.js
./server/src/providers/llm/openai.provider.js
./server/src/providers/llm/openrouter.provider.js
./server/src/providers/llmProviderFactory.js
./server/src/routes/ai.routes.js
./server/src/routes/health.routes.js
./server/src/routes/itinerary.routes.js
./server/src/server.js
./server/src/services/ai/ai.service.js
./server/src/utils/AppError.js
./server/src/utils/createApiResponse.js
./server/src/utils/retry.js
./server/src/validators/enhancedSchemaValidator.js
./server/src/validators/requestSchemas.js
./test-api.sh
./~$Tasks.xlsx
```

## 3. Naming conventions
- **Folder names:** kebab‑case (`src/components`, `src/pages`, `src/services`)  
- **File names:** PascalCase for React components (`BottomSheet.jsx`), camelCase for utilities (`utils/constants.js`)  
- **Component names:** PascalCase (`BottomSheet`, `LandingPage`)  
- **Barrel files:** None; imports reference the component file directly.

## 4. Import convention
- **Path alias:** None – only relative paths are used.  
- **Example import (from `LandingPage.jsx`):**  
  ```js
  import { BottomSheet } from '../components/BottomSheet.jsx';
  ```

## 5. State management
- **Mechanism:** React Context (`TravelContext.jsx`) with a custom hook `useTravel` (`src/context/useTravel.js`).  
- **Example read/write (from `LandingPage.jsx`):**  
  ```js
  const { wizardState, setWizardState, saveTrip } = useTravel();

  // update wizard state
  setWizardState(prev => ({ ...prev, mood: newMoods }));
  // save generated itinerary
  saveTrip(itinerary);
  ```

## 6. API / data layer
- **Location:** Service files under `src/services` (`itinerary.js`, `geocode.js`, `tripStorage.js`).  
- **Fetch mechanism:** Native `fetch` (e.g., in `geocode.js`) and `axios` (used in server‑side LLM providers).  
- **Base fetch utility path:** `src/services/geocode.js` (contains `fetchLocationAutocomplete` and `reverseGeocode`).

## 7. Styling system
- **System:** Tailwind CSS 3.4 (configured in `tailwind.config.js`) plus occasional plain CSS modules (`*.css`).  
- **Design tokens:** Defined in `src/utils/constants.js` and Tailwind theme extensions. Example token names: `ocean-deep`, `sunset-gold`, `forest-trail`.

## 8. Routing
- **Router:** `react-router-dom` v6.15.0.  
- **Navigation example (from `LandingPage.jsx`):**  
  ```js
  const navigate = useNavigate();
  navigate('/results');
  ```

## 9. Existing components — quick reference
| Component | File path | Description (≤ 8 words) |
|-----------|-----------|------------------------|


## 1. Stack
- **Framework:** Vite 5 (React)  
- **Language:** JavaScript (JSX)  
- **Key libraries**
  - UI: React 18, react‑leaflet 1.9, Tailwind CSS 3.4, custom components in `src/components`
  - Routing: react‑router‑dom 6.15
  - State management: React Context (`TravelContext.jsx`) + custom hook `useTravel`
  - HTTP: native `fetch` (and axios in server‑side LLM providers)

## 2. Directory tree
```
./.DS_Store
./LICENSE
./README.md
./Tasks.xlsx
./app/.env.development.example
./app/.env.production.example
./app/.prettierrc.json
./app/README.md
./app/eslint.config.js
./app/index.html
./app/package-lock.json
./app/package.json
./app/postcss.config.js
./app/public/destination-placeholder.svg
./app/script.js
./app/src/App.jsx
./app/src/App_temp.jsx
./app/src/components/ArrivalTimeDisplay.jsx
./app/src/components/BottomSheet.jsx
./app/src/components/CategoryChip.jsx
./app/src/components/DayCardAccordion.jsx
./app/src/components/DeleteTripModal.jsx
./app/src/components/DestinationHeader.jsx
./app/src/components/DurationPill.jsx
./app/src/components/ErrorScreen.css
./app/src/components/ErrorScreen.jsx
./app/src/components/ExtendedWizard.jsx
./app/src/components/ItineraryList.jsx
./app/src/components/ItineraryStopCard.jsx
./app/src/components/Layout.jsx
./app/src/components/LoadingScreen.css
./app/src/components/LoadingScreen.jsx
./app/src/components/MapView.jsx
./app/src/components/Navigation.jsx
./app/src/components/StopDetailSheet.css
./app/src/components/StopDetailSheet.jsx
./app/src/components/SuggestionCard.jsx
./app/src/components/Toast.jsx
./app/src/components/TravelNote.jsx
./app/src/components/TripBriefChips.jsx
./app/src/components/TripChip.css
./app/src/components/TripChip.jsx
./app/src/components/TripDetailShell.jsx
./app/src/components/TripHistoryCard.jsx
./app/src/components/map/MapView.css
./app/src/components/map/MapView.jsx
./app/src/components/map/RecenterControl.js
./app/src/config/runtime.js
./app/src/context/TravelContext.jsx
./app/src/context/travelContext.js
./app/src/context/useTravel.js
./app/src/features/results/generateItinerary.js
./app/src/features/results/image.js
./app/src/features/results/itineraryApi.js
./app/src/features/results/itineraryNormalizer.js
./app/src/index.css
./app/src/main.jsx
./app/src/pages/LandingPage.jsx
./app/src/pages/MyTripsPage.jsx
./app/src/pages/ResultsPage.jsx
./app/src/pages/TripDetailPage.jsx
./app/src/services/geocode.js
./app/src/services/itinerary.js
./app/src/services/pdf.js
./app/src/services/promptBuilder.js
./app/src/services/share.js
./app/src/services/tripStorage.js
./app/src/utils/constants.js
./app/styles.css
./app/tailwind.config.js
./app/vite.config.js
./requirements/TravelMind_Requirements_final_2.pdf
./requirements/extract_requirements.py
./requirements/requirements_text.txt
./server/.dockerignore
./server/.env.example
./server/Dockerfile
./server/README.md
./server/docker-compose.yml
./server/package-lock.json
./server/package.json
./server/schemaValidator.js
./server/server.js
./server/src/app.js
./server/src/config/cors.js
./server/src/config/env.js
./server/src/config/logger.js
./server/src/config/rateLimit.js
./server/src/controllers/ai.controller.js
./server/src/controllers/health.controller.js
./server/src/controllers/itinerary.controller.js
./server/src/middleware/circuitBreaker.middleware.js
./server/src/middleware/error.middleware.js
./server/src/middleware/rateLimit.middleware.js
./server/src/middleware/requestLogger.middleware.js
./server/src/middleware/validation.middleware.js
./server/src/prompts/builders/promptBuilder.js
./server/src/prompts/templates/destination.prompt.js
./server/src/prompts/templates/itinerary.prompt.js
./server/src/prompts/templates/regenerateStop.prompt.js
./server/src/providers/llm/anthropic.provider.js
./server/src/providers/llm/base.provider.js
./server/src/providers/llm/deepseek.provider.js
./server/src/providers/llm/gemini.provider.js
./server/src/providers/llm/mock.provider.js
./server/src/providers/llm/mockData.js
./server/src/providers/llm/openai.provider.js
./server/src/providers/llm/openrouter.provider.js
./server/src/providers/llmProviderFactory.js
./server/src/routes/ai.routes.js
./server/src/routes/health.routes.js
./server/src/routes/itinerary.routes.js
./server/src/server.js
./server/src/services/ai/ai.service.js
./server/src/utils/AppError.js
./server/src/utils/createApiResponse.js
./server/src/utils/retry.js
./server/src/validators/enhancedSchemaValidator.js
./server/src/validators/requestSchemas.js
./test-api.sh
./~$Tasks.xlsx
```

## 3. Naming conventions
- **Folder names:** kebab‑case (`src/components`, `src/pages`, `src/services`)  
- **File names:** PascalCase for React components (`BottomSheet.jsx`), camelCase for utilities (`utils/constants.js`)  
- **Component names:** PascalCase (`BottomSheet`, `LandingPage`)  
- **Barrel files:** None; imports reference files directly.

## 4. Import convention
- **Path alias:** No alias – only relative paths.  
- **Example import (from `LandingPage.jsx`):**  
  ```js
  import { BottomSheet } from '../components/BottomSheet.jsx';
  ```

## 5. State management
- **Mechanism:** React Context (`TravelContext.jsx`) with custom hook `useTravel` (`src/context/useTravel.js`).  
- **Example read/write (from `LandingPage.jsx`):**  
  ```js
  const { wizardState, setWizardState, saveTrip } = useTravel();

  // update wizard state
  setWizardState(prev => ({ ...prev, mood: newMoods }));
  // save generated itinerary
  saveTrip(itinerary);
  ```

## 6. API / data layer
- **Location:** Service files under `src/services` (`itinerary.js`, `geocode.js`, `tripStorage.js`).  
- **Fetch mechanism:** Native `fetch` (e.g., in `geocode.js`) and `axios` (used in server‑side LLM providers).  
- **Base fetch utility path:** `src/services/geocode.js` (contains `fetchLocationAutocomplete` and `reverseGeocode`).

## 7. Styling system
- **System:** Tailwind CSS 3.4 (configured in `tailwind.config.js`) plus occasional plain CSS modules (`*.css`).  
- **Design tokens:** Defined in `src/utils/constants.js` and Tailwind theme extensions.  
  - Example token names: `ocean-deep`, `sunset-gold`, `forest-trail`.

## 8. Routing
- **Router:** `react-router-dom` v6.15.0.  
- **Navigation example (from `LandingPage.jsx`):**  
  ```js
  const navigate = useNavigate();
  navigate('/results');
  ```

## 9. Existing components — quick reference
| Component | File path | Description (≤ 8 words) |
|-----------|-----------|------------------------|


## 1. Stack  
- **Framework:** Vite 5 (React)  
- **Language:** JavaScript (JSX)  
- **Key libraries**  
  - UI: React 18, react‑leaflet 1.9, Tailwind CSS 3.4, custom component library in `src/components`  
  - Routing: react‑router‑dom 6.15  
  - State management: React Context (`TravelContext.jsx`) + hook `useTravel`  
  - HTTP: native `fetch` (and `axios` in server‑side LLM providers)  

## 2. Directory tree  
```
./.DS_Store
./LICENSE
./README.md
./Tasks.xlsx
./app/.env.development.example
./app/.env.production.example
./app/.prettierrc.json
./app/README.md
./app/eslint.config.js
./app/index.html
./app/package-lock.json
./app/package.json
./app/postcss.config.js
./app/public/destination-placeholder.svg
./app/script.js
./app/src/App.jsx
./app/src/App_temp.jsx
./app/src/components/ArrivalTimeDisplay.jsx
./app/src/components/BottomSheet.jsx
./app/src/components/CategoryChip.jsx
./app/src/components/DayCardAccordion.jsx
./app/src/components/DeleteTripModal.jsx
./app/src/components/DestinationHeader.jsx
./app/src/components/DurationPill.jsx
./app/src/components/ErrorScreen.css
./app/src/components/ErrorScreen.jsx
./app/src/components/ExtendedWizard.jsx
./app/src/components/ItineraryList.jsx
./app/src/components/ItineraryStopCard.jsx
./app/src/components/Layout.jsx
./app/src/components/LoadingScreen.css
./app/src/components/LoadingScreen.jsx
./app/src/components/MapView.jsx
./app/src/components/Navigation.jsx
./app/src/components/StopDetailSheet.css
./app/src/components/StopDetailSheet.jsx
./app/src/components/SuggestionCard.jsx
./app/src/components/Toast.jsx
./app/src/components/TravelNote.jsx
./app/src/components/TripBriefChips.jsx
./app/src/components/TripChip.css
./app/src/components/TripChip.jsx
./app/src/components/TripDetailShell.jsx
./app/src/components/TripHistoryCard.jsx
./app/src/components/map/MapView.css
./app/src/components/map/MapView.jsx
./app/src/components/map/RecenterControl.js
./app/src/config/runtime.js
./app/src/context/TravelContext.jsx
./app/src/context/travelContext.js
./app/src/context/useTravel.js
./app/src/features/results/generateItinerary.js
./app/src/features/results/image.js
./app/src/features/results/itineraryApi.js
./app/src/features/results/itineraryNormalizer.js
./app/src/index.css
./app/src/main.jsx
./app/src/pages/LandingPage.jsx
./app/src/pages/MyTripsPage.jsx
./app/src/pages/ResultsPage.jsx
./app/src/pages/TripDetailPage.jsx
./app/src/services/geocode.js
./app/src/services/itinerary.js
./app/src/services/pdf.js
./app/src/services/promptBuilder.js
./app/src/services/share.js
./app/src/services/tripStorage.js
./app/src/utils/constants.js
./app/styles.css
./app/tailwind.config.js
./app/vite.config.js
./requirements/TravelMind_Requirements_final_2.pdf
./requirements/extract_requirements.py
./requirements/requirements_text.txt
./server/.dockerignore
./server/.env.example
./server/Dockerfile
./server/README.md
./server/docker-compose.yml
./server/package-lock.json
./server/package.json
./server/schemaValidator.js
./server/server.js
./server/src/app.js
./server/src/config/cors.js
./server/src/config/env.js
./server/src/config/logger.js
./server/src/config/rateLimit.js
./server/src/controllers/ai.controller.js
./server/src/controllers/health.controller.js
./server/src/controllers/itinerary.controller.js
./server/src/middleware/circuitBreaker.middleware.js
./server/src/middleware/error.middleware.js
./server/src/middleware/rateLimit.middleware.js
./server/src/middleware/requestLogger.middleware.js
./server/src/middleware/validation.middleware.js
./server/src/prompts/builders/promptBuilder.js
./server/src/prompts/templates/destination.prompt.js
./server/src/prompts/templates/itinerary.prompt.js
./server/src/prompts/templates/regenerateStop.prompt.js
./server/src/providers/llm/anthropic.provider.js
./server/src/providers/llm/base.provider.js
./server/src/providers/llm/deepseek.provider.js
./server/src/providers/llm/gemini.provider.js
./server/src/providers/llm/mock.provider.js
./server/src/providers/llm/mockData.js
./server/src/providers/llm/openai.provider.js
./server/src/providers/llm/openrouter.provider.js
./server/src/providers/llmProviderFactory.js
./server/src/routes/ai.routes.js
./server/src/routes/health.routes.js
./server/src/routes/itinerary.routes.js
./server/src/server.js
./server/src/services/ai/ai.service.js
./server/src/utils/AppError.js
./server/src/utils/createApiResponse.js
./server/src/utils/retry.js
./server/src/validators/enhancedSchemaValidator.js
./server/src/validators/requestSchemas.js
./test-api.sh
./~$Tasks.xlsx
```

## 3. Naming conventions  
- **Folders:** kebab‑case (`src/components`, `src/pages`, `src/services`)  
- **Files:** PascalCase for React components (`BottomSheet.jsx`), camelCase for utilities (`utils/constants.js`)  
- **Components:** PascalCase (`BottomSheet`, `LandingPage`)  
- **Barrel files:** None; each import points to the concrete file.  

## 4. Import convention  
- **Path alias:** No alias – only relative paths.  
- **Example import (from `LandingPage.jsx`):**  
  ```js
  import { BottomSheet } from '../components/BottomSheet.jsx';
  ```

## 5. State management  
- **Mechanism:** React Context (`TravelContext.jsx`) + custom hook `useTravel` (`src/context/useTravel.js`).  
- **Example read/write (from `LandingPage.jsx`):**  
  ```js
  const { wizardState, setWizardState, saveTrip } = useTravel();

  // update wizard state
  setWizardState(prev => ({ ...prev, mood: newMoods }));
  // persist generated itinerary
  saveTrip(itinerary);
  ```

## 6. API / data layer  
- **Location:** Service layer under `src/services` (`itinerary.js`, `geocode.js`, `tripStorage.js`).  
- **Fetch mechanism:** Native `fetch` (e.g., in `geocode.js`) and `axios` (used by server‑side LLM providers).  
- **Base fetch utility:** `src/services/geocode.js` (offers `fetchLocationAutocomplete` & `reverseGeocode`).  

## 7. Styling system  
- **System:** Tailwind CSS 3.4 (configured in `tailwind.config.js`) with occasional plain CSS modules (`*.css`).  
- **Design tokens:** Defined in `src/utils/constants.js` and Tailwind theme extensions.  
  - Example token names: `ocean-deep`, `sunset-gold`, `forest-trail`.  

## 8. Routing  
- **Router:** `react-router-dom` v6.15.0.  
- **Navigation example (from `LandingPage.jsx`):**  
  ```js
  const navigate = useNavigate();
  navigate('/results');
  ```

## 9. Existing components — quick reference  
| Component | File path | 8‑word description |
|-----------|-----------|--------------------|
| ArrivalTimeDisplay | src/components/ArrivalTimeDisplay.jsx | Shows arrival time badge |
| BottomSheet | src/components/BottomSheet.jsx | Modal sheet with tabs |
| CategoryChip | src/components/CategoryChip.jsx | Visual tag for categories |
| DayCardAccordion | src/components/DayCardAccordion.jsx | Collapsible day itinerary |
| DeleteTripModal | src/components/DeleteTripModal.jsx | Confirmation modal for delete |
| DestinationHeader | src/components/DestinationHeader.jsx | Header with destination info |
| DurationPill | src/components/DurationPill.jsx | Badge for trip duration |
| ErrorScreen | src/components/ErrorScreen.jsx | Full‑screen error UI |
| ExtendedWizard | src/components/ExtendedWizard.jsx | Advanced trip‑wizard UI |
| ItineraryList | src/components/ItineraryList.jsx | Lists itinerary days |
| ItineraryStopCard | src/components/ItineraryStopCard.jsx | Card for a single stop |
| Layout | src/components/Layout.jsx | Page layout wrapper |
| LoadingScreen | src/components/LoadingScreen.jsx | Overlay while generating |
| MapView | src/components/MapView.jsx | Interactive map display |
| Navigation | src/components/Navigation.jsx | Bottom navigation bar |
| StopDetailSheet | src/components/StopDetailSheet.jsx | Bottom sheet for stop details |
| SuggestionCard | src/components/SuggestionCard.jsx | Card for destination suggestions |
| Toast | src/components/Toast.jsx | Transient notification popup |
| TravelNote | src/components/TravelNote.jsx | Note component for travel tips |
| TripBriefChips | src/components/TripBriefChips.jsx | Summary chips on landing page |
| TripChip | src/components/TripChip.jsx | Individual chip UI |
| TripDetailShell | src/components/TripDetailShell.jsx | Wrapper for trip detail view |
| TripHistoryCard | src/components/TripHistoryCard.jsx | Card showing past trips |
| RecenterControl | src/components/map/RecenterControl.js | Map recenter button |
| LandingPage | src/pages/LandingPage.jsx | Home screen with wizard |
| MyTripsPage | src/pages/MyTripsPage.jsx | Lists saved trips |
| ResultsPage | src/pages/ResultsPage.jsx | Shows generated itinerary |
| TripDetailPage | src/pages/TripDetailPage.jsx | Detailed view of a trip |

## 10. Patterns to replicate  
- **Chosen screen:** `src/pages/LandingPage.jsx` (complete wizard UI)  

**Import block (first 10 lines):**  
```js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravel } from '../context/useTravel.js';
import { BottomSheet } from '../components/BottomSheet.jsx';
import { TripBriefChips } from '../components/TripBriefChips.jsx';
import { ExtendedWizard } from '../components/ExtendedWizard.jsx';
import { generateItineraryForExtendedWizard, generateItineraryForWizard } from '../features/results/generateItinerary.js';
import { durationOptions, moodOptions, radiusOptions } from '../utils/constants.js';
```

**Component signature line:**  
```js
function LandingPage() {
```
