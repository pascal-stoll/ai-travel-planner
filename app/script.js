const state = {
  wizard: {
    mood: [],
    duration: '',
    radius: '',
    budget: 'Mid-Range',
    adults: 2,
    children: 0,
    transport: ['Car'],
    location: { label: 'Your location', coords: null },
  },
  activeItinerary: null,
  history: [],
  sheetMode: null,
  longPressTimer: null,
  map: null,
  mapLayer: null,
};

const moodOptions = [
  { value: 'Relax', label: 'Relax', description: 'Low energy, comfort, calm beaches' },
  { value: 'Adventure', label: 'Adventure', description: 'Active landscapes, hiking, exploration' },
  { value: 'Culture', label: 'Culture', description: 'Museums, history, local craft' },
  { value: 'Food', label: 'Food', description: 'Local cuisine, markets, tastings' },
  { value: 'Nature', label: 'Nature', description: 'Parks, hikes, green escapes' },
  { value: 'Nightlife', label: 'Nightlife', description: 'Bars, music, late-evening energy' },
];

const durationOptions = [
  { value: 'A few hours', label: 'A few hours', description: 'Short local escape with 3–5 highlights' },
  { value: '1 Day', label: '1 Day', description: 'A full day itinerary with punctual stops' },
  { value: '2–3 Days', label: '2–3 Days', description: 'A weekend-style trip with leisure time' },
  { value: '1 Week+', label: '1 Week+', description: 'A longer trip with deeper exploration' },
];

const radiusOptions = [
  { value: '< 50 km', label: '< 50 km', description: 'Nearby escape' },
  { value: '50–150 km', label: '50–150 km', description: 'Day trip range' },
  { value: '150–300 km', label: '150–300 km', description: 'Regional weekend' },
  { value: '300–500 km', label: '300–500 km', description: 'Extended travel radius' },
  { value: 'Anywhere', label: 'Anywhere', description: 'No distance limit' },
];

const budgetOptions = ['Economy', 'Budget', 'Mid-Range', 'Premium', 'Luxury'];
const transportModes = ['On Foot', 'Car', 'Public Transport', 'Train', 'Flight'];
const destinationLibrary = [
  { name: 'Lisbon', mood: 'Relax', coords: [38.7223, -9.1393], subtitle: 'A warm coastal city with mellow charm.' },
  { name: 'Lake Como', mood: 'Relax', coords: [45.9979, 9.2572], subtitle: 'A quiet waterside escape with scenic villas.' },
  { name: 'Interlaken', mood: 'Adventure', coords: [46.6863, 7.8632], subtitle: 'Mountain trails, canyon swings, and adrenaline.' },
  { name: 'Reykjavik', mood: 'Adventure', coords: [64.1265, -21.8174], subtitle: 'Volcanoes, waterfalls, and midnight adventures.' },
  { name: 'Kyoto', mood: 'Culture', coords: [35.0116, 135.7681], subtitle: 'Temples, tea houses, and heritage walks.' },
  { name: 'Istanbul', mood: 'Food', coords: [41.0082, 28.9784], subtitle: 'Markets, street food, and rich flavour scenes.' },
  { name: 'Rome', mood: 'Culture', coords: [41.9028, 12.4964], subtitle: 'Ancient history with modern cafés nearby.' },
  { name: 'Naples', mood: 'Food', coords: [40.8518, 14.2681], subtitle: 'Pizza origins, seaside dining, and lively markets.' },
  { name: 'Vancouver', mood: 'Nature', coords: [49.2827, -123.1207], subtitle: 'Parks, coastal trails, and forest views.' },
  { name: 'Mallorca', mood: 'Nature', coords: [39.6953, 3.0176], subtitle: 'Island bays, olive groves, and quiet villages.' },
  { name: 'Berlin', mood: 'Nightlife', coords: [52.5200, 13.4050], subtitle: 'Late nights, underground bars, and creative energy.' },
  { name: 'Barcelona', mood: 'Nightlife', coords: [41.3851, 2.1734], subtitle: 'Cocktails, live music, and seaside sunset bars.' },
];

const selectors = {
  moodBtn: document.getElementById('moodBtn'),
  durationBtn: document.getElementById('durationBtn'),
  radiusBtn: document.getElementById('radiusBtn'),
  surpriseBtn: document.getElementById('surpriseBtn'),
  extendedBtn: document.getElementById('extendedBtn'),
  historyBtn: document.getElementById('historyBtn'),
  closeHistoryBtn: document.getElementById('closeHistoryBtn'),
  backFromSuggestionsBtn: document.getElementById('backFromSuggestionsBtn'),
  saveTripBtn: document.getElementById('saveTripBtn'),
  shareBtn: document.getElementById('shareBtn'),
  exportBtn: document.getElementById('exportBtn'),
  swapBtn: document.getElementById('swapBtn'),
  sheetOverlay: document.getElementById('sheetOverlay'),
  sheetTitle: document.getElementById('sheetTitle'),
  sheetContent: document.getElementById('sheetContent'),
  sheetCloseBtn: document.getElementById('sheetCloseBtn'),
  moodValue: document.getElementById('moodValue'),
  durationValue: document.getElementById('durationValue'),
  radiusValue: document.getElementById('radiusValue'),
  tripBrief: document.getElementById('tripBrief'),
  briefChips: document.getElementById('briefChips'),
  landingScreen: document.getElementById('landingScreen'),
  loadingScreen: document.getElementById('loadingScreen'),
  suggestionsScreen: document.getElementById('suggestionsScreen'),
  suggestionsContainer: document.getElementById('suggestionsContainer'),
  resultsScreen: document.getElementById('resultsScreen'),
  viewList: document.getElementById('viewList'),
  viewMap: document.getElementById('viewMap'),
  historyScreen: document.getElementById('historyScreen'),
  historyList: document.getElementById('historyList'),
  historySearch: document.getElementById('historySearch'),
  toast: document.getElementById('toast'),
  destinationName: document.getElementById('destinationName'),
  destinationMood: document.getElementById('destinationMood'),
  destinationSubtitle: document.getElementById('destinationSubtitle'),
  destinationHeader: document.getElementById('destinationHeader'),
  loadingMessage: document.getElementById('loadingMessage'),
};

const queryViewButtons = Array.from(document.querySelectorAll('[data-view]'));

function showScreen(screen) {
  document.querySelectorAll('.screen').forEach((node) => node.classList.remove('active'));
  screen.classList.add('active');
}

function showSheet(mode, title) {
  state.sheetMode = mode;
  selectors.sheetTitle.textContent = title;
  selectors.sheetOverlay.classList.remove('hidden');
  selectors.sheetOverlay.setAttribute('aria-hidden', 'false');
  selectors.sheetContent.innerHTML = '';
}

function closeSheet() {
  selectors.sheetOverlay.classList.add('hidden');
  selectors.sheetOverlay.setAttribute('aria-hidden', 'true');
  selectors.sheetContent.innerHTML = '';
  state.sheetMode = null;
}

function toast(message) {
  selectors.toast.textContent = message;
  selectors.toast.classList.add('visible');
  setTimeout(() => selectors.toast.classList.remove('visible'), 2600);
}

function updateTripBrief() {
  const { mood, duration, radius } = state.wizard;
  if (!mood.length || !duration || !radius) {
    selectors.tripBrief.classList.add('hidden');
    return;
  }

  selectors.tripBrief.classList.remove('hidden');
  selectors.tripBrief.innerHTML = `
    <div class="chip">Mood: ${mood.join(', ')}</div>
    <div class="chip">Duration: ${duration}</div>
    <div class="chip">Radius: ${radius}</div>
  `;
}

function updateSummaryCards() {
  selectors.moodValue.textContent = state.wizard.mood.length ? state.wizard.mood.join(', ') : 'Choose your mood';
  selectors.durationValue.textContent = state.wizard.duration || 'Pick a trip length';
  selectors.radiusValue.textContent = state.wizard.radius || 'Set distance';
}

function isFastPathReady() {
  return state.wizard.mood.length && state.wizard.duration && state.wizard.radius;
}

function setWizardValue(field, value) {
  state.wizard[field] = value;
  updateSummaryCards();
  updateTripBrief();
  if (field === 'radius') {
    if (selectors.radiusValue.textContent === 'Anywhere') {
      // no action here
    }
  }
  if (isFastPathReady()) {
    setTimeout(() => {
      if (state.sheetMode === null && isFastPathReady()) {
        startGeneration({ fastPath: true });
      }
    }, 300);
  }
}

function showMoodSelector() {
  showSheet('mood', 'Select your mood');
  const grid = document.createElement('div');
  grid.className = 'card-grid';
  moodOptions.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'selection-tile';
    button.innerHTML = `<h4>${option.label}</h4><p>${option.description}</p>`;
    button.addEventListener('click', () => {
      const selected = state.wizard.mood.includes(option.value)
        ? state.wizard.mood.filter((value) => value !== option.value)
        : [...state.wizard.mood, option.value];
      state.wizard.mood = selected;
      setWizardValue('mood', selected);
      button.classList.toggle('selected', selected.includes(option.value));
    });
    grid.append(button);
  });
  selectors.sheetContent.append(grid);
}

function showDurationSelector() {
  showSheet('duration', 'Select trip duration');
  const grid = document.createElement('div');
  grid.className = 'card-grid';
  durationOptions.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'selection-tile';
    button.innerHTML = `<h4>${option.label}</h4><p>${option.description}</p>`;
    button.addEventListener('click', () => {
      setWizardValue('duration', option.value);
      closeSheet();
    });
    grid.append(button);
  });
  selectors.sheetContent.append(grid);
}

async function showRadiusSelector() {
  showSheet('radius', 'Choose your travel radius');
  const grid = document.createElement('div');
  grid.className = 'card-grid';
  radiusOptions.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'selection-tile';
    button.innerHTML = `<h4>${option.label}</h4><p>${option.description}</p>`;
    button.addEventListener('click', () => {
      setWizardValue('radius', option.value);
      closeSheet();
    });
    grid.append(button);
  });
  selectors.sheetContent.append(grid);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      state.wizard.location.coords = [position.coords.latitude, position.coords.longitude];
      const label = await reverseGeocode(position.coords.latitude, position.coords.longitude);
      state.wizard.location.label = label || 'Current location';
      const note = document.createElement('p');
      note.className = 'small-chip';
      note.textContent = `Starting from: ${state.wizard.location.label}`;
      selectors.sheetContent.prepend(note);
    }, () => {
      const note = document.createElement('p');
      note.className = 'small-chip';
      note.textContent = 'Location unavailable. Using default context.';
      selectors.sheetContent.prepend(note);
    });
  }
}

async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Current location';
  } catch (error) {
    return null;
  }
}

function openExtendedWizard() {
  showSheet('extended', 'Full wizard — more control');
  selectors.sheetContent.innerHTML = '';
  const form = document.createElement('form');
  form.className = 'sheet-form';
  form.innerHTML = `
    <div class="selection-tile" style="padding:16px;font-size:0.95rem;">
      <label style="display:block;font-weight:700;margin-bottom:8px;">Departure city</label>
      <input id="wizardCity" type="text" placeholder="Enter a city" style="width:100%;min-height:48px;border:1px solid var(--border);border-radius:16px;padding:12px;" />
      <small style="color: var(--muted);">Autocomplete is powered by OpenStreetMap search.</small>
      <div id="autocompleteList" style="margin-top:10px;display:grid;gap:10px;"></div>
    </div>
    <div class="card-grid"></div>
    <div class="selection-tile" style="padding:16px;">
      <label style="font-weight:700;display:block;margin-bottom:8px;">Trip type</label>
      <div id="wizardMoodList" style="display:grid;gap:10px;"></div>
    </div>
    <div class="selection-tile" style="padding:16px;">
      <label style="font-weight:700;display:block;margin-bottom:8px;">Budget tier</label>
      <div id="wizardBudgetList" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;"></div>
    </div>
    <div class="selection-tile" style="padding:16px;">
      <label style="font-weight:700;display:block;margin-bottom:8px;">Transport modes</label>
      <div id="wizardTransportList" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;"></div>
    </div>
    <div class="card-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;">
      <div class="selection-tile" style="padding:16px;">
        <label style="display:block;font-weight:700;margin-bottom:8px;">Adults</label>
        <input id="wizardAdults" type="number" min="1" max="20" value="${state.wizard.adults}" style="width:100%;min-height:48px;border:1px solid var(--border);border-radius:16px;padding:12px;" />
      </div>
      <div class="selection-tile" style="padding:16px;">
        <label style="display:block;font-weight:700;margin-bottom:8px;">Children</label>
        <input id="wizardChildren" type="number" min="0" max="10" value="${state.wizard.children}" style="width:100%;min-height:48px;border:1px solid var(--border);border-radius:16px;padding:12px;" />
      </div>
    </div>
    <button id="wizardSubmitBtn" type="button" class="primary-button" style="width:100%;margin-top:18px;">Continue to destination suggestions</button>
  `;
  selectors.sheetContent.append(form);

  const wizardCity = form.querySelector('#wizardCity');
  const autocompleteList = form.querySelector('#autocompleteList');
  const wizardMoodList = form.querySelector('#wizardMoodList');
  const wizardBudgetList = form.querySelector('#wizardBudgetList');
  const wizardTransportList = form.querySelector('#wizardTransportList');
  const wizardAdults = form.querySelector('#wizardAdults');
  const wizardChildren = form.querySelector('#wizardChildren');

  moodOptions.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'selection-tile';
    button.textContent = option.label;
    button.addEventListener('click', () => {
      const selected = state.wizard.mood.includes(option.value)
        ? state.wizard.mood.filter((value) => value !== option.value)
        : [...state.wizard.mood, option.value];
      state.wizard.mood = selected;
      form.querySelectorAll('#wizardMoodList .selection-tile').forEach((node) => {
        node.classList.toggle('selected', selected.includes(node.textContent));
      });
    });
    wizardMoodList.append(button);
  });

  budgetOptions.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'selection-tile';
    button.textContent = option;
    button.addEventListener('click', () => {
      state.wizard.budget = option;
      form.querySelectorAll('#wizardBudgetList .selection-tile').forEach((node) => {
        node.classList.toggle('selected', node.textContent === option);
      });
    });
    wizardBudgetList.append(button);
  });
  form.querySelectorAll('#wizardBudgetList .selection-tile').forEach((node) => {
    if (node.textContent === state.wizard.budget) node.classList.add('selected');
  });

  transportModes.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'selection-tile';
    button.textContent = option;
    button.addEventListener('click', () => {
      const selected = state.wizard.transport.includes(option)
        ? state.wizard.transport.filter((value) => value !== option)
        : [...state.wizard.transport, option];
      state.wizard.transport = selected;
      form.querySelectorAll('#wizardTransportList .selection-tile').forEach((node) => {
        node.classList.toggle('selected', selected.includes(node.textContent));
      });
    });
    wizardTransportList.append(button);
  });
  form.querySelectorAll('#wizardTransportList .selection-tile').forEach((node) => {
    if (state.wizard.transport.includes(node.textContent)) node.classList.add('selected');
  });

  wizardCity.addEventListener('input', async (event) => {
    const query = event.target.value.trim();
    if (!query) {
      autocompleteList.innerHTML = '';
      return;
    }
    const options = await fetchAutocomplete(query);
    autocompleteList.innerHTML = '';
    options.slice(0, 5).forEach((place) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'selection-tile';
      card.textContent = place.display_name;
      card.addEventListener('click', () => {
        wizardCity.value = place.display_name;
        state.wizard.location.label = place.display_name;
        state.wizard.location.coords = [parseFloat(place.lat), parseFloat(place.lon)];
        autocompleteList.innerHTML = '';
      });
      autocompleteList.append(card);
    });
  });

  form.querySelector('#wizardSubmitBtn').addEventListener('click', () => {
    state.wizard.adults = Number(wizardAdults.value) || 2;
    state.wizard.children = Number(wizardChildren.value) || 0;
    if (!state.wizard.mood.length) {
      toast('Please select at least one mood.');
      return;
    }
    if (!state.wizard.location.coords) {
      toast('Please select a departure city from the list.');
      return;
    }
    closeSheet();
    showDestinationSuggestions();
  });
}

async function fetchAutocomplete(query) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=6`);
    return await response.json();
  } catch (error) {
    return [];
  }
}

function showDestinationSuggestions() {
  showScreen(selectors.suggestionsScreen);
  selectors.suggestionsContainer.innerHTML = '';
  const suggestions = generateSuggestions();
  suggestions.forEach((destination) => {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.innerHTML = `
      <h3>${destination.name}</h3>
      <p>${destination.subtitle}</p>
      <div class="card-row">
        <span class="chip">Mood fit: ${destination.match}</span>
        <span class="chip">Distance: ${destination.distance} km</span>
      </div>
      <button class="primary-button" type="button">Select</button>
    `;
    card.querySelector('button').addEventListener('click', () => {
      state.activeItinerary = buildItinerary(destination);
      showGeneratedResults();
    });
    selectors.suggestionsContainer.append(card);
  });
}

function generateSuggestions() {
  const moodList = state.wizard.mood;
  const location = state.wizard.location.coords;
  const radius = state.wizard.radius;
  const candidates = destinationLibrary.filter((item) => moodList.includes(item.mood));
  const selected = candidates.slice(0, 3);
  return selected.map((item, index) => ({
    ...item,
    match: item.mood,
    distance: location ? Math.round(Math.abs(item.coords[0] - location[0]) * 110 + Math.abs(item.coords[1] - location[1]) * 80 + index * 60) : 250 + index * 50,
  }));
}

function buildItinerary(destination) {
  const days = durationToDays(state.wizard.duration || '1 Day');
  const dayPlans = [];
  const baseCoords = destination.coords;
  for (let day = 1; day <= days; day += 1) {
    const stops = [];
    const stopCount = day === 1 ? 4 : Math.max(3, 5 - day);
    for (let stop = 1; stop <= stopCount; stop += 1) {
      stops.push({
        id: `${day}-${stop}`,
        time: `${9 + stop * 2}:00`,
        name: generateStopName(destination.name, stop),
        description: generateStopDescription(destination.name, stop),
        duration: `${1 + (stop % 2)}h`,
        transport: state.wizard.transport[stop % state.wizard.transport.length] || 'Car',
        coords: [baseCoords[0] + (stop - 3) * 0.04 + day * 0.01, baseCoords[1] + (stop - 2) * 0.05 - day * 0.01],
      });
    }
    dayPlans.push({ day, title: `Day ${day}`, stops });
  }

  return {
    id: crypto.randomUUID(),
    destination: destination.name,
    subtitle: destination.subtitle,
    mood: state.wizard.mood.join(', '),
    budget: state.wizard.budget,
    duration: state.wizard.duration,
    radius: state.wizard.radius,
    transport: state.wizard.transport,
    adults: state.wizard.adults,
    children: state.wizard.children,
    generatedAt: new Date().toISOString(),
    days: dayPlans,
    center: destination.coords,
  };
}

function generateStopName(destination, stopIndex) {
  const templates = [
    `Historic centre walk`,
    `Local market discovery`,
    `Iconic viewpoint`,
    `Signature restaurant`,
    `Hidden culture stop`,
    `Green escape`,
  ];
  return `${templates[stopIndex % templates.length]} in ${destination}`;
}

function generateStopDescription(destination, stopIndex) {
  const phrases = [
    `Experience a locally loved spot with regional specialties.`,
    `Take time to absorb atmosphere and capture photos.`,
    `Enjoy a relaxed visit with time to explore side streets.`,
    `Dive into the culture with a short guided route.`,
  ];
  return phrases[stopIndex % phrases.length];
}

function durationToDays(duration) {
  if (duration === 'A few hours') return 1;
  if (duration === '1 Day') return 1;
  if (duration === '2–3 Days') return 3;
  if (duration === '1 Week+') return 6;
  return 1;
}

async function startGeneration({ fastPath = false } = {}) {
  if (!isFastPathReady()) return;
  showScreen(selectors.loadingScreen);
  updateLoadingChips();
  selectors.loadingMessage.textContent = 'Constructing your personalised itinerary...';
  const prompt = buildPrompt();
  console.log('AI prompt:', prompt);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const destination = chooseDestinationForFastPath();
  state.activeItinerary = buildItinerary(destination);
  showGeneratedResults();
}

function buildPrompt() {
  return {
    mood: state.wizard.mood,
    duration: state.wizard.duration,
    radius: state.wizard.radius,
    budget: state.wizard.budget,
    transport: state.wizard.transport,
    location: state.wizard.location.label,
  };
}

function chooseDestinationForFastPath() {
  const moods = state.wizard.mood;
  const filtered = destinationLibrary.filter((dest) => moods.includes(dest.mood));
  if (filtered.length) return filtered[Math.floor(Math.random() * filtered.length)];
  return destinationLibrary[Math.floor(Math.random() * destinationLibrary.length)];
}

function updateLoadingChips() {
  selectors.briefChips.innerHTML = '';
  selectors.briefChips.className = 'chip-row';
  state.wizard.mood.forEach((mood) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = mood;
    selectors.briefChips.append(chip);
  });
  if (state.wizard.duration) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = state.wizard.duration;
    selectors.briefChips.append(chip);
  }
  if (state.wizard.radius) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = state.wizard.radius;
    selectors.briefChips.append(chip);
  }
}

function showGeneratedResults() {
  if (!state.activeItinerary) return;
  renderResultHeader();
  renderItineraryList();
  initializeMap();
  showScreen(selectors.resultsScreen);
  saveActiveItinerary();
}

function renderResultHeader() {
  selectors.destinationName.textContent = state.activeItinerary.destination;
  selectors.destinationSubtitle.textContent = state.activeItinerary.subtitle;
  selectors.destinationMood.textContent = state.activeItinerary.mood;
  selectors.destinationHeader.style.backgroundImage = `linear-gradient(180deg, rgba(23,41,83,0.08), rgba(1,10,41,0.86)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80')`;
}

function renderItineraryList() {
  selectors.viewList.innerHTML = '';
  state.activeItinerary.days.forEach((day) => {
    const dayCard = document.createElement('section');
    dayCard.className = 'itinerary-day';
    dayCard.innerHTML = `<h3>${day.title}</h3>`;
    day.stops.forEach((stop) => {
      const stopCard = document.createElement('div');
      stopCard.className = 'stop-card';
      stopCard.innerHTML = `
        <strong>${stop.time} · ${stop.name}</strong>
        <p>${stop.description}</p>
        <div class="stop-meta">
          <span class="stop-tag">Duration: ${stop.duration}</span>
          <span class="stop-tag">Transport: ${stop.transport}</span>
        </div>
        <div class="stop-actions">
          <button class="small-button" type="button" data-day="${day.day}" data-stop="${stop.id}">Regenerate stop</button>
        </div>
      `;
      stopCard.querySelector('button').addEventListener('click', () => {
        regenerateStop(day.day, stop.id);
      });
      dayCard.append(stopCard);
    });
    selectors.viewList.append(dayCard);
  });
}

function initializeMap() {
  if (!window.L) return;
  if (!selectors.viewMap.classList.contains('hidden')) {
    setTimeout(renderMap, 80);
  }
}

function renderMap() {
  if (state.map) {
    state.map.remove();
    state.map = null;
  }
  state.map = L.map('mapContainer', { zoomControl: true, attributionControl: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(state.map);
  const allCoords = [];
  state.activeItinerary.days.forEach((day) => {
    day.stops.forEach((stop) => {
      const marker = L.marker(stop.coords).addTo(state.map).bindPopup(`<strong>${stop.name}</strong><br>${stop.description}`);
      allCoords.push(stop.coords);
    });
  });
  if (allCoords.length) {
    const polyline = L.polyline(allCoords, { color: '#f06d3c', weight: 4, opacity: 0.8 }).addTo(state.map);
    state.map.fitBounds(polyline.getBounds(), { padding: [28, 28] });
  } else {
    state.map.setView(state.activeItinerary.center, 10);
  }
}

function regenerateStop(dayNumber, stopId) {
  const day = state.activeItinerary.days.find((item) => item.day === Number(dayNumber));
  if (!day) return;
  const stop = day.stops.find((item) => item.id === stopId);
  if (!stop) return;
  stop.description = `Updated suggestion: ${stop.description.split('.')[0]}. Enjoy a refreshed local experience.`;
  stop.time = `${Number(stop.time.split(':')[0]) + 1}:00`;
  renderItineraryList();
  toast('Stop regenerated successfully.');
  saveActiveItinerary();
}

function saveActiveItinerary() {
  localStorage.setItem('travelmind-active', JSON.stringify(state.activeItinerary));
}

function loadActiveItinerary() {
  const raw = localStorage.getItem('travelmind-active');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function loadHistory() {
  const raw = localStorage.getItem('travelmind-history');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function restoreState() {
  state.history = loadHistory();
  const active = loadActiveItinerary();
  if (active) {
    state.activeItinerary = active;
    showGeneratedResults();
  } else {
    updateSummaryCards();
    updateTripBrief();
    showScreen(selectors.landingScreen);
  }
}

function renderHistoryList(filter = '') {
  selectors.historyList.innerHTML = '';
  const list = state.history.filter((trip) => trip.destination.toLowerCase().includes(filter.toLowerCase()));
  if (!list.length) {
    selectors.historyList.innerHTML = '<p style="color: var(--muted);">No saved trips matching this term.</p>';
    return;
  }
  list.forEach((trip) => {
    const card = document.createElement('article');
    card.className = 'history-card';
    card.innerHTML = `
      <header>
        <div>
          <h3>${trip.destination}</h3>
          <p>${new Date(trip.generatedAt).toLocaleDateString()}</p>
        </div>
        <button class="text-button" type="button">Delete</button>
      </header>
      <div class="card-row">
        <span class="chip">Mood: ${trip.mood}</span>
        <span class="chip">Duration: ${trip.duration}</span>
        <span class="chip">Radius: ${trip.radius}</span>
      </div>
      <button class="primary-button" type="button">Open trip</button>
    `;
    const deleteBtn = card.querySelector('button.text-button');
    const openBtn = card.querySelector('.primary-button');
    deleteBtn.addEventListener('click', () => deleteHistoryTrip(trip.id));
    openBtn.addEventListener('click', () => {
      state.activeItinerary = trip;
      showGeneratedResults();
      showScreen(selectors.resultsScreen);
    });
    selectors.historyList.append(card);
  });
}

function deleteHistoryTrip(id) {
  state.history = state.history.filter((trip) => trip.id !== id);
  localStorage.setItem('travelmind-history', JSON.stringify(state.history));
  renderHistoryList(selectors.historySearch.value);
  toast('Trip removed from history.');
}

function addActiveTripToHistory() {
  if (!state.activeItinerary) return;
  state.history = state.history.filter((trip) => trip.id !== state.activeItinerary.id);
  state.history.unshift(state.activeItinerary);
  localStorage.setItem('travelmind-history', JSON.stringify(state.history));
  toast('Trip saved to your history.');
}

function exportPdf() {
  if (!state.activeItinerary || !window.jspdf) {
    toast('Unable to export.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const titleY = 40;
  doc.setFontSize(22);
  doc.text(`TravelMind · ${state.activeItinerary.destination}`, 40, titleY);
  doc.setFontSize(12);
  doc.text(`Mood: ${state.activeItinerary.mood} • Duration: ${state.activeItinerary.duration} • Radius: ${state.activeItinerary.radius}`, 40, titleY + 24);
  doc.setTextColor(100);
  doc.text(`Generated ${new Date(state.activeItinerary.generatedAt).toLocaleDateString()}`, 40, titleY + 44);
  drawRouteGraphic(doc, 40, 90, 520, 130);
  let y = 240;
  state.activeItinerary.days.forEach((day) => {
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text(day.title, 40, y);
    y += 18;
    day.stops.forEach((stop) => {
      doc.setFontSize(11);
      doc.text(`• ${stop.time} ${stop.name} (${stop.duration})`, 48, y);
      y += 16;
      const lines = doc.splitTextToSize(stop.description, 500);
      doc.setFontSize(10);
      doc.text(lines, 52, y);
      y += lines.length * 12 + 12;
      if (y > 730) {
        doc.addPage();
        y = 40;
      }
    });
  });
  doc.save(`${state.activeItinerary.destination.replace(/\s+/g, '_')}_Itinerary.pdf`);
}

function drawRouteGraphic(doc, x, y, width, height) {
  doc.setFillColor(235, 245, 255);
  doc.roundRect(x, y, width, height, 14, 14, 'F');
  const stops = state.activeItinerary.days.flatMap((day) => day.stops).slice(0, 6);
  const step = width / (stops.length + 1);
  stops.forEach((stop, index) => {
    const cx = x + step * (index + 1);
    const cy = y + height / 2;
    if (index > 0) {
      doc.setDrawColor(240, 109, 60);
      doc.setLineWidth(3);
      doc.line(cx - step + 10, cy, cx - 10, cy);
    }
    doc.setFillColor(240, 109, 60);
    doc.circle(cx, cy, 7, 'F');
    doc.setFontSize(8);
    doc.text(`${index + 1}`, cx - 2.5, cy + 3.5, { baseline: 'middle' });
  });
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Static route preview', x + 12, y + height - 12);
}

function copyShareLink() {
  if (!state.activeItinerary) return;
  const payload = btoa(JSON.stringify(state.activeItinerary));
  const url = `${location.origin}${location.pathname}?share=${encodeURIComponent(payload)}`;
  navigator.clipboard.writeText(url).then(() => {
    toast('Share link copied to clipboard.');
  });
}

function loadSharedLink() {
  const params = new URLSearchParams(window.location.search);
  const share = params.get('share');
  if (!share) return false;
  try {
    const decoded = JSON.parse(atob(share));
    state.activeItinerary = decoded;
    showGeneratedResults();
    return true;
  } catch (error) {
    return false;
  }
}

selectors.moodBtn.addEventListener('click', showMoodSelector);
selectors.durationBtn.addEventListener('click', showDurationSelector);
selectors.radiusBtn.addEventListener('click', showRadiusSelector);
selectors.surpriseBtn.addEventListener('click', () => {
  const randomMood = [moodOptions[Math.floor(Math.random() * moodOptions.length)].value];
  const randomDuration = durationOptions[Math.floor(Math.random() * durationOptions.length)].value;
  const randomRadius = radiusOptions[Math.floor(Math.random() * radiusOptions.length)].value;
  state.wizard.mood = randomMood;
  setWizardValue('duration', randomDuration);
  setWizardValue('radius', randomRadius);
  selectors.wizardCity?.value;
  startGeneration({ fastPath: true });
});
selectors.extendedBtn.addEventListener('click', openExtendedWizard);
selectors.historyBtn.addEventListener('click', () => {
  renderHistoryList();
  showScreen(selectors.historyScreen);
});
selectors.closeHistoryBtn.addEventListener('click', () => showScreen(selectors.landingScreen));
selectors.backFromSuggestionsBtn.addEventListener('click', () => showScreen(selectors.landingScreen));
selectors.sheetCloseBtn.addEventListener('click', closeSheet);
selectors.saveTripBtn.addEventListener('click', addActiveTripToHistory);
selectors.shareBtn.addEventListener('click', copyShareLink);
selectors.exportBtn.addEventListener('click', exportPdf);
selectors.swapBtn.addEventListener('click', () => {
  startGeneration({ fastPath: true });
  toast('Swapping destination...');
});
selectors.historySearch.addEventListener('input', (event) => renderHistoryList(event.target.value));
queryViewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    queryViewButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    const view = button.dataset.view;
    selectors.viewList.classList.toggle('hidden', view !== 'list');
    selectors.viewMap.classList.toggle('hidden', view !== 'map');
    if (view === 'map') {
      renderMap();
    }
  });
});

selectors.sheetOverlay.addEventListener('click', (event) => {
  if (event.target === selectors.sheetOverlay) closeSheet();
});

function initLongPress(button, action) {
  let pressed = false;
  button.addEventListener('pointerdown', () => {
    pressed = false;
    state.longPressTimer = window.setTimeout(() => {
      pressed = true;
      action();
    }, 550);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((eventName) => {
    button.addEventListener(eventName, () => {
      clearTimeout(state.longPressTimer);
    });
  });
}

initLongPress(selectors.moodBtn, openExtendedWizard);
initLongPress(selectors.durationBtn, openExtendedWizard);
initLongPress(selectors.radiusBtn, openExtendedWizard);

function init() {
  updateSummaryCards();
  updateTripBrief();
  if (!loadSharedLink()) {
    restoreState();
  }
}

window.addEventListener('load', init);
