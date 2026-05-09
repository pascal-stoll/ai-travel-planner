import { useMemo, useState, useEffect, useRef } from 'react';
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
  const [extendedMode, setExtendedMode] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [toast, setToast] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [geolocationState, setGeolocationState] = useState({
    loading: false,
    city: null,
    error: null,
    showFallback: false
  });
  const navigate = useNavigate();

  const updateWizard = (changes) => {
    setWizardState((prev) => ({ ...prev, ...changes }));
  };

  // Geolocation functions
  const reverseGeocode = async (lat, lng) => {
    try {
      // Using Nominatim API for reverse geocoding (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      
      // Extract city name from the response
      const city = data.address?.city || 
                   data.address?.town || 
                   data.address?.village || 
                   data.address?.municipality ||
                   `${data.address?.state || 'Unknown Location'}`;
      
      return city;
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return 'Unknown Location';
    }
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setGeolocationState({
        loading: false,
        city: null,
        error: 'Geolocation not supported',
        showFallback: true
      });
      return;
    }

    setGeolocationState(prev => ({ ...prev, loading: true, error: null }));

    const timeoutId = setTimeout(() => {
      setGeolocationState({
        loading: false,
        city: null,
        error: 'Location detection timed out',
        showFallback: true
      });
    }, 10000); // 10 second timeout

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      clearTimeout(timeoutId);
      
      const { latitude, longitude } = position.coords;
      const city = await reverseGeocode(latitude, longitude);
      
      setGeolocationState({
        loading: false,
        city,
        error: null,
        showFallback: false
      });

      // Update wizard state with coordinates
      updateWizard({
        location: {
          label: city,
          coords: [latitude, longitude]
        }
      });

    } catch (error) {
      clearTimeout(timeoutId);
      
      let errorMessage = 'Location access denied';
      let showFallback = true;

      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Location permission denied';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Location unavailable';
      } else if (error.code === error.TIMEOUT) {
        errorMessage = 'Location detection timed out';
      }

      setGeolocationState({
        loading: false,
        city: null,
        error: errorMessage,
        showFallback
      });
    }
  };

  const resetGeolocation = () => {
    setGeolocationState({
      loading: false,
      city: null,
      error: null,
      showFallback: false
    });
  };

  // Long-press detection
  const longPressTimers = useRef({});
  const LONG_PRESS_DURATION = 500; // 500ms as per RF-WIZ13

  const handleButtonMouseDown = (type) => {
    longPressTimers.current[type] = setTimeout(() => {
      setSheetMode(type);
      setExtendedMode(true);
    }, LONG_PRESS_DURATION);
  };

  const handleButtonMouseUp = (type) => {
    if (longPressTimers.current[type]) {
      clearTimeout(longPressTimers.current[type]);
      delete longPressTimers.current[type];
    }
  };

  const handleButtonMouseLeave = (type) => {
    if (longPressTimers.current[type]) {
      clearTimeout(longPressTimers.current[type]);
      delete longPressTimers.current[type];
    }
  };

  const handleButtonTouchStart = (type) => {
    longPressTimers.current[type] = setTimeout(() => {
      setSheetMode(type);
      setExtendedMode(true);
    }, LONG_PRESS_DURATION);
  };

  const handleButtonTouchEnd = (type) => {
    if (longPressTimers.current[type]) {
      clearTimeout(longPressTimers.current[type]);
      delete longPressTimers.current[type];
    }
  };

  const handleButtonClick = (type) => {
    // Only handle click if not in long-press mode
    if (!extendedMode) {
      setSheetMode(type);
      setExtendedMode(false);
      
      // Reset geolocation state when opening non-radius sheets
      if (type !== 'radius') {
        resetGeolocation();
      } else {
        // Trigger geolocation when opening radius sheet
        detectLocation();
      }
    }
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

  const handleMoodSelect = (selectedMoods) => {
    updateWizard({ mood: selectedMoods });
    if (!extendedMode) {
      setSheetMode(null);
      // Small delay for confirmation animation
      setTimeout(() => {
        // Mood selection complete, duration button becomes dominant
      }, 300);
    }
  };

  const handleDurationSelect = (duration) => {
    updateWizard({ duration });
    if (!extendedMode) {
      setSheetMode(null);
      // Small delay for confirmation animation
      setTimeout(() => {
        // Duration selection complete, radius button becomes dominant
      }, 300);
    }
  };

  const handleRadiusSelect = (radius) => {
    updateWizard({ radius });
    if (!extendedMode) {
      setSheetMode(null);
      // Auto-trigger generation after all three selections
      setTimeout(() => {
        handleAutoGenerate();
      }, 300);
    }
  };

  const handleAutoGenerate = async () => {
    if (!wizardState.mood.length || !wizardState.duration || !wizardState.radius) {
      setToast('Please complete all selections before generating.');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      const destination = chooseDestination(wizardState);
      const itinerary = buildItinerary(destination, wizardState);
      saveTrip(itinerary);
      navigate('/results');
    } catch (error) {
      setToast('Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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

  const getExtendedContent = () => {
    switch (sheetMode) {
      case 'mood':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Mood Priority Weighting</h3>
              <p className="text-sm text-slate-600 mb-4">Select primary and secondary moods for more precise recommendations.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Primary Mood</label>
                  <select 
                    value={wizardState.primaryMood || wizardState.mood[0] || ''} 
                    onChange={(e) => updateWizard({ primaryMood: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="">Select primary mood</option>
                    {moodOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Secondary Mood</label>
                  <select 
                    value={wizardState.secondaryMood || ''} 
                    onChange={(e) => updateWizard({ secondaryMood: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="">Select secondary mood (optional)</option>
                    {moodOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'duration':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Exact Date & Time</h3>
              <p className="text-sm text-slate-600 mb-4">Specify exact departure date and time for precise scheduling.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Departure Date</label>
                  <input 
                    type="date" 
                    value={wizardState.departureDate || ''} 
                    onChange={(e) => updateWizard({ departureDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Departure Time</label>
                  <input 
                    type="time" 
                    value={wizardState.departureTime || ''} 
                    onChange={(e) => updateWizard({ departureTime: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'radius':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Custom Distance & Location</h3>
              <p className="text-sm text-slate-600 mb-4">Set custom distance limits and specify your starting location.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Starting City</label>
                  <input 
                    type="text" 
                    placeholder="Enter city name..."
                    value={wizardState.location?.label || ''} 
                    onChange={(e) => updateWizard({
                      location: {
                        label: e.target.value,
                        coords: null
                      }
                    })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Custom Distance (km)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="500" 
                    value={wizardState.customRadius || ''} 
                    onChange={(e) => updateWizard({ customRadius: e.target.value })}
                    placeholder="Enter distance in km"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Budget Tier</label>
                  <select 
                    value={wizardState.budget} 
                    onChange={(e) => updateWizard({ budget: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    {['Economy', 'Budget', 'Mid-Range', 'Premium', 'Luxury'].map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Determine which button should be dominant based on selection state
  const getButtonState = () => {
    if (!wizardState.mood.length) {
      return { dominant: 'mood', showDuration: false, showRadius: false };
    }
    if (!wizardState.duration) {
      return { dominant: 'duration', showDuration: true, showRadius: false };
    }
    if (!wizardState.radius) {
      return { dominant: 'radius', showDuration: true, showRadius: true };
    }
    return { dominant: 'generate', showDuration: true, showRadius: true };
  };

  const buttonState = getButtonState();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 grid gap-6 rounded-[2rem] bg-white/90 p-10 shadow-card backdrop-blur-xl">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">AI-powered itinerary builder</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">From mood to map in under a minute.</h1>
          <p className="max-w-2xl text-lg text-slate-600 sm:text-xl">Choose your vibe, set your tempo, and TravelMind builds a personalised itinerary with map, timeline, and travel logic.</p>
        </div>

        {/* Trip Brief - Show selected values */}
        {buttonState.dominant === 'generate' && (
          <TripBriefChips 
            wizardState={wizardState} 
            onChipClick={(type) => setSheetMode(type)} 
          />
        )}

        {/* Three Button Flow */}
        <div className="grid gap-4">
          {/* Mood Button - Always visible, primary when no selections */}
          <button
            type="button"
            onClick={() => handleButtonClick('mood')}
            onMouseDown={() => handleButtonMouseDown('mood')}
            onMouseUp={() => handleButtonMouseUp('mood')}
            onMouseLeave={() => handleButtonMouseLeave('mood')}
            onTouchStart={() => handleButtonTouchStart('mood')}
            onTouchEnd={() => handleButtonTouchEnd('mood')}
            className={`rounded-[1.75rem] border p-6 text-left transition-all duration-300 ${
              buttonState.dominant === 'mood'
                ? 'border-ocean-deep bg-ocean-deep text-white shadow-lg scale-105'
                : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${buttonState.dominant === 'mood' ? 'text-white' : 'text-slate-900'}`}>Mood</p>
                <p className={`mt-1 text-base ${buttonState.dominant === 'mood' ? 'text-white/90' : 'text-slate-600'}`}>
                  {wizardState.mood.length ? wizardState.mood.join(', ') : 'Choose your travel style'}
                </p>
              </div>
              <div className={`text-2xl ${buttonState.dominant === 'mood' ? 'text-white' : 'text-slate-400'}`}>
                {wizardState.mood.length ? '✓' : '🎭'}
              </div>
            </div>
          </button>

          {/* Duration Button - Visible after mood selection */}
          {buttonState.showDuration && (
            <button
              type="button"
              onClick={() => handleButtonClick('duration')}
              onMouseDown={() => handleButtonMouseDown('duration')}
              onMouseUp={() => handleButtonMouseUp('duration')}
              onMouseLeave={() => handleButtonMouseLeave('duration')}
              onTouchStart={() => handleButtonTouchStart('duration')}
              onTouchEnd={() => handleButtonTouchEnd('duration')}
              className={`rounded-[1.75rem] border p-6 text-left transition-all duration-300 ${
                buttonState.dominant === 'duration'
                  ? 'border-forest-trail bg-forest-trail text-white shadow-lg scale-105'
                  : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${buttonState.dominant === 'duration' ? 'text-white' : 'text-slate-900'}`}>Duration</p>
                  <p className={`mt-1 text-base ${buttonState.dominant === 'duration' ? 'text-white/90' : 'text-slate-600'}`}>
                    {wizardState.duration || 'How long is your trip?'}
                  </p>
                </div>
                <div className={`text-2xl ${buttonState.dominant === 'duration' ? 'text-white' : 'text-slate-400'}`}>
                  {wizardState.duration ? '✓' : '⏱️'}
                </div>
              </div>
            </button>
          )}

          {/* Radius Button - Visible after duration selection */}
          {buttonState.showRadius && (
            <button
              type="button"
              onClick={() => handleButtonClick('radius')}
              onMouseDown={() => handleButtonMouseDown('radius')}
              onMouseUp={() => handleButtonMouseUp('radius')}
              onMouseLeave={() => handleButtonMouseLeave('radius')}
              onTouchStart={() => handleButtonTouchStart('radius')}
              onTouchEnd={() => handleButtonTouchEnd('radius')}
              className={`rounded-[1.75rem] border p-6 text-left transition-all duration-300 ${
                buttonState.dominant === 'radius'
                  ? 'border-sunset-gold bg-sunset-gold text-white shadow-lg scale-105'
                  : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${buttonState.dominant === 'radius' ? 'text-white' : 'text-slate-900'}`}>Radius</p>
                  <p className={`mt-1 text-base ${buttonState.dominant === 'radius' ? 'text-white/90' : 'text-slate-600'}`}>
                    {wizardState.radius || 'How far to travel?'}
                  </p>
                </div>
                <div className={`text-2xl ${buttonState.dominant === 'radius' ? 'text-white' : 'text-slate-400'}`}>
                  {wizardState.radius ? '✓' : '📍'}
                </div>
              </div>
            </button>
          )}

          {/* Generate Button - Visible when all selections complete */}
          {buttonState.dominant === 'generate' && (
            <button
              type="button"
              onClick={handleAutoGenerate}
              disabled={isGenerating}
              className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-left text-white transition-all hover:bg-slate-800 disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Generate Itinerary</p>
                  <p className="mt-1 text-base text-white/90">
                    {isGenerating ? 'Creating your perfect trip...' : 'Ready to build your itinerary!'}
                  </p>
                </div>
                <div className="text-2xl">
                  {isGenerating ? '⏳' : '🚀'}
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Alternative Options */}
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
      </header>

      {/* Loading Screen Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-6 text-6xl">🗺️</div>
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">Building your itinerary...</h2>
            <div className="mb-6 flex justify-center space-x-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-ocean-deep"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-forest-trail" style={{ animationDelay: '0.1s' }}></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-sunset-gold" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {wizardState.mood.map((mood) => (
                <span key={mood} className="rounded-full bg-ocean-deep px-3 py-1 text-sm font-medium text-white">
                  {mood}
                </span>
              ))}
              {wizardState.duration && (
                <span className="rounded-full bg-forest-trail px-3 py-1 text-sm font-medium text-white">
                  {wizardState.duration}
                </span>
              )}
              {wizardState.radius && (
                <span className="rounded-full bg-sunset-gold px-3 py-1 text-sm font-medium text-white">
                  {wizardState.radius}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheets */}
      <BottomSheet
        title={
          sheetMode === 'mood' ? 'Choose your travel mood' :
          sheetMode === 'duration' ? 'Select trip duration' :
          sheetMode === 'radius' ? 'Choose travel radius' :
          'Full travel wizard'
        }
        open={Boolean(sheetMode)}
        onClose={() => {
          setSheetMode(null);
          setExtendedMode(false);
          resetGeolocation();
        }}
        showExtended={extendedMode}
        extendedContent={getExtendedContent()}
      >
        {sheetMode === 'mood' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const newMoods = wizardState.mood.includes(option.value)
                    ? wizardState.mood.filter((m) => m !== option.value)
                    : [...wizardState.mood, option.value];
                  handleMoodSelect(newMoods);
                }}
                className={`rounded-2xl border-2 p-6 text-center transition-all hover:scale-105 ${
                  wizardState.mood.includes(option.value)
                    ? 'border-ocean-deep bg-ocean-deep text-white shadow-lg'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="mb-3 text-3xl">
                  {option.value === 'Relax' && '🏖️'}
                  {option.value === 'Adventure' && '🏔️'}
                  {option.value === 'Culture' && '🏛️'}
                  {option.value === 'Food' && '🍽️'}
                  {option.value === 'Nature' && '🌲'}
                  {option.value === 'Nightlife' && '🌙'}
                </div>
                <p className="font-semibold text-lg">{option.label}</p>
                <p className={`mt-2 text-sm ${wizardState.mood.includes(option.value) ? 'text-white/90' : 'text-slate-500'}`}>
                  {option.description}
                </p>
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
                onClick={() => handleDurationSelect(option.value)}
                className={`rounded-2xl border-2 p-6 text-left transition-all hover:scale-105 ${
                  wizardState.duration === option.value
                    ? 'border-forest-trail bg-forest-trail text-white shadow-lg'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="mb-2 text-2xl">
                      {option.value === 'A few hours' && '☀️'}
                      {option.value === '1 Day' && '🌅'}
                      {option.value === '2–3 Days' && '🏖️'}
                      {option.value === '1 Week+' && '🗺️'}
                    </div>
                    <p className="font-semibold text-lg">{option.label}</p>
                    <p className={`mt-2 text-sm ${wizardState.duration === option.value ? 'text-white/90' : 'text-slate-500'}`}>
                      {option.description}
                    </p>
                  </div>
                  {wizardState.duration === option.value && (
                    <div className="text-2xl">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {sheetMode === 'radius' && (
          <div className="space-y-4">
            {/* Location Status */}
            <div className="text-center">
              {geolocationState.loading && (
                <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-600"></div>
                  <span>Detecting your location...</span>
                </div>
              )}
              
              {geolocationState.city && (
                <div className="text-sm text-slate-600">
                  📍 Starting from: <span className="font-medium text-slate-900">{geolocationState.city}</span>
                </div>
              )}
              
              {geolocationState.showFallback && (
                <div className="space-y-2">
                  <div className="text-sm text-slate-600">
                    📍 Starting from:
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your city..."
                    value={wizardState.location?.label || ''}
                    onChange={(e) => updateWizard({
                      location: {
                        label: e.target.value,
                        coords: null
                      }
                    })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                </div>
              )}
              
              {geolocationState.error && !geolocationState.showFallback && (
                <div className="text-sm text-amber-600">
                  ⚠️ {geolocationState.error}
                </div>
              )}
            </div>
            
            {/* Distance Presets */}
            <div className="grid gap-3">
              {radiusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRadiusSelect(option.value)}
                  className={`rounded-2xl border-2 p-6 text-left transition-all hover:scale-105 ${
                    wizardState.radius === option.value
                      ? 'border-sunset-gold bg-sunset-gold text-white shadow-lg'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-2 text-2xl">
                        {option.value === '< 50 km' && '🏠'}
                        {option.value === '50–150 km' && '🚗'}
                        {option.value === '150–300 km' && '✈️'}
                        {option.value === '300–500 km' && '🚄'}
                        {option.value === 'Anywhere' && '🌍'}
                      </div>
                      <p className="font-semibold text-lg">{option.label}</p>
                      <p className={`mt-2 text-sm ${wizardState.radius === option.value ? 'text-white/90' : 'text-slate-500'}`}>
                        {option.description}
                      </p>
                    </div>
                    {wizardState.radius === option.value && (
                      <div className="text-2xl">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {sheetMode === 'wizard' && (
          <ExtendedWizard onComplete={(data) => {
            updateWizard(data);
            setSheetMode(null);
          }} />
        )}
      </BottomSheet>

      {/* Toast Messages */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-slate-900 px-4 py-3 text-white shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}

export default LandingPage;
