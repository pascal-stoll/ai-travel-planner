import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext.jsx';
import { BottomSheet } from '../components/BottomSheet.jsx';
import { SuggestionCard } from '../components/SuggestionCard.jsx';
import { TripBriefChips } from '../components/TripBriefChips.jsx';
import { ExtendedWizard } from '../components/ExtendedWizard.jsx';
import { buildItinerary, chooseDestination, generateSuggestions } from '../services/itinerary.js';
import { durationOptions, moodOptions, radiusOptions } from '../utils/constants.js';

function LandingPage() {
  const { wizardState, setWizardState, saveTrip } = useTravel();
  const [sheetMode, setSheetMode] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const updateWizard = (changes) => {
    setWizardState((prev) => ({ ...prev, ...changes }));
  };

  const handleSurprise = () => {
    const randomMood = [moodOptions[Math.floor(Math.random() * moodOptions.length)].value];
    const randomDuration = durationOptions[Math.floor(Math.random() * durationOptions.length)].value;
    const randomRadius = radiusOptions[Math.floor(Math.random() * radiusOptions.length)].value;
    const preview = { ...wizardState, mood: randomMood, duration: randomDuration, radius: randomRadius };
    const destination = chooseDestination(preview);
    const itinerary = buildItinerary(destination, preview);
    saveTrip(itinerary);
    navigate('/results');
  };

  const handleFastPlan = () => {
    if (!wizardState.mood.length || !wizardState.duration || !wizardState.radius) {
      setToast('Please choose a mood, duration and radius before planning.');
      return;
    }
    const destination = chooseDestination(wizardState);
    const itinerary = buildItinerary(destination, wizardState);
    saveTrip(itinerary);
    navigate('/results');
  };

  const handleWizardSubmit = () => {
    if (!wizardState.mood.length || !wizardState.duration || !wizardState.radius) {
      setToast('Complete the wizard selections to see destination suggestions.');
      return;
    }

    const items = generateSuggestions(wizardState);
    setSuggestions(items);
    setToast('Tap a suggestion to build your itinerary.');
  };

  const selectSuggestion = (destination) => {
    const itinerary = buildItinerary(destination, wizardState);
    saveTrip(itinerary);
    navigate('/results');
  };

  const handleSelectOption = (key, value) => {
    updateWizard({ [key]: value });
    setSheetMode(null);
  };

  const currentSummary = useMemo(
    () => ({
      mood: wizardState.mood.length ? wizardState.mood.join(', ') : 'Choose your mood',
      duration: wizardState.duration || 'Pick a trip length',
      radius: wizardState.radius || 'Set a radius',
    }),
    [wizardState],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 grid gap-6 rounded-[2rem] bg-white/90 p-10 shadow-card backdrop-blur-xl">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">AI-powered itinerary builder</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">From mood to map in under a minute.</h1>
          <p className="max-w-2xl text-lg text-slate-600 sm:text-xl">Choose your vibe, set your tempo, and TravelMind builds a personalised itinerary with map, timeline, and travel logic.</p>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Mood</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{currentSummary.mood}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Duration</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{currentSummary.duration}</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Radius</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{currentSummary.radius}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleSurprise} className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">
              Surprise Me
            </button>
            <button type="button" onClick={() => setSheetMode('wizard')} className="rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
              Open full wizard
            </button>
            <Link to="/trips" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
              My Trips
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-8 rounded-[2rem] bg-white/90 p-8 shadow-card backdrop-blur-xl sm:p-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <button type="button" onClick={() => setSheetMode('mood')} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-left transition hover:border-slate-300 hover:bg-slate-100">
            <p className="text-sm font-semibold text-slate-900">Mood</p>
            <p className="mt-3 text-base text-slate-600">{currentSummary.mood}</p>
          </button>
          <button type="button" onClick={() => setSheetMode('duration')} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-left transition hover:border-slate-300 hover:bg-slate-100">
            <p className="text-sm font-semibold text-slate-900">Duration</p>
            <p className="mt-3 text-base text-slate-600">{currentSummary.duration}</p>
          </button>
          <button type="button" onClick={() => setSheetMode('radius')} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-left transition hover:border-slate-300 hover:bg-slate-100">
            <p className="text-sm font-semibold text-slate-900">Radius</p>
            <p className="mt-3 text-base text-slate-600">{currentSummary.radius}</p>
          </button>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
          <TripBriefChips wizardState={wizardState} />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleFastPlan} className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">
              Build quick itinerary
            </button>
            <button type="button" onClick={handleWizardSubmit} className="rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
              Generate destination suggestions
            </button>
          </div>
        </div>

        {suggestions.length > 0 ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Suggested destinations</h2>
              <p className="mt-2 text-slate-600">Pick one of these tailored recommendations to create a custom itinerary.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {suggestions.map((suggestion) => (
                <SuggestionCard key={suggestion.name} suggestion={suggestion} onSelect={selectSuggestion} />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <BottomSheet title={sheetMode === 'wizard' ? 'Full travel wizard' : sheetMode === 'mood' ? 'Choose mood' : sheetMode === 'duration' ? 'Select duration' : 'Choose radius'} open={Boolean(sheetMode)} onClose={() => setSheetMode(null)}>
        {sheetMode === 'mood' && (
          <div className="grid gap-3">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectOption('mood', wizardState.mood.includes(option.value) ? wizardState.mood.filter((item) => item !== option.value) : [...wizardState.mood, option.value])}
                className={`rounded-3xl p-4 text-left transition ${wizardState.mood.includes(option.value) ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
              >
                <p className="font-semibold">{option.label}</p>
                <p className="mt-1 text-sm text-slate-500">{option.description}</p>
              </button>
            ))}
          </div>
        )}

        {sheetMode === 'duration' && (
          <div className="grid gap-3">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectOption('duration', option.value)}
                className={`rounded-3xl p-4 text-left transition ${wizardState.duration === option.value ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
              >
                <p className="font-semibold">{option.label}</p>
                <p className="mt-1 text-sm text-slate-500">{option.description}</p>
              </button>
            ))}
          </div>
        )}

        {sheetMode === 'radius' && (
          <div className="grid gap-3">
            {radiusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectOption('radius', option.value)}
                className={`rounded-3xl p-4 text-left transition ${wizardState.radius === option.value ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
              >
                <p className="font-semibold">{option.label}</p>
                <p className="mt-1 text-sm text-slate-500">{option.description}</p>
              </button>
            ))}
          </div>
        )}

        {sheetMode === 'wizard' && <ExtendedWizard wizardState={wizardState} onSubmit={() => { handleWizardSubmit(); setSheetMode(null); }} onChange={updateWizard} />}
      </BottomSheet>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-3xl bg-slate-950 px-5 py-4 text-sm text-white shadow-xl shadow-slate-900/10">
          <div className="flex items-center gap-4">
            <p>{toast}</p>
            <button type="button" onClick={() => setToast('')} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white transition hover:bg-white/20">Dismiss</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default LandingPage;
