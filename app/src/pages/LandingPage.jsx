import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravel } from '../context/useTravel.js';
import { BottomSheet } from '../components/BottomSheet.jsx';
import { TripBriefChips } from '../components/TripBriefChips.jsx';
import { ExtendedWizard } from '../components/ExtendedWizard.jsx';
import { SurpriseMeButton } from '../components/SurpriseMeButton.jsx';
import { generateItineraryForExtendedWizard, generateItineraryForWizard } from '../features/results/generateItinerary.js';
import { durationOptions, moodOptions, radiusOptions } from '../utils/constants.js';

function LandingPage() {
  const { wizardState, setWizardState, saveTrip } = useTravel();
  const [sheetMode, setSheetMode] = useState(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('edit') === 'true' ? 'wizard' : null;
  });
  const [extendedMode, setExtendedMode] = useState(false);
  const [toast, setToast] = useState('');
  const [generationState, setGenerationState] = useState('idle');
  const [geolocationState, setGeolocationState] = useState({
    loading: false,
    city: null,
    error: null,
    showFallback: false
  });
  const navigate = useNavigate();
  const isGenerating = generationState === 'loading';

  const runGeneration = async (state, generator) => {
    setGenerationState('loading');
    setToast('');

    try {
      const { itinerary } = await generator(state);
      saveTrip(itinerary);
      setGenerationState('success');
      navigate('/results');
    } catch (error) {
      setGenerationState('error');
      setToast(error?.message || 'Failed to generate itinerary. Please try again.');
    }
  };

  const updateWizard = (changes) => {
    if (generationState === 'error') {
      setGenerationState('idle');
    }
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
    }
  };

  const handleAutoGenerate = async () => {
    if (!wizardState.mood.length || !wizardState.duration || !wizardState.radius) {
      setToast('Please complete all selections before generating.');
      return;
    }

    runGeneration(wizardState, generateItineraryForWizard);
  };

  const handleExtendedWizardSubmit = async (wizardData) => {
    await runGeneration(wizardData, generateItineraryForExtendedWizard);
  };

  const handleOpenExtendedWizard = () => {
    setSheetMode('wizard');
    setExtendedMode(false);
    resetGeolocation();
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
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/75 bg-[linear-gradient(180deg,#fffdf8_0%,#f8f3ea_100%)] px-4 pb-12 pt-8 shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-16 h-56 w-56 rounded-full bg-ocean-deep/10 blur-3xl" />
          <div className="absolute right-[-8%] top-10 h-64 w-64 rounded-full bg-sunset-gold/10 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.92)_0%,rgba(255,252,247,0.9)_40%,rgba(248,243,234,0)_72%)]" />
          <div className="absolute inset-x-[-5%] bottom-0 h-52 bg-[linear-gradient(180deg,transparent_0%,rgba(163,195,205,0.12)_14%,rgba(110,150,160,0.18)_100%)] [clip-path:polygon(0_56%,10%_34%,18%_44%,28%_28%,36%_46%,46%_20%,58%_42%,70%_24%,82%_44%,92%_30%,100%_48%,100%_100%,0_100%)]" />
          <div className="absolute inset-x-[6%] bottom-0 h-48 bg-[linear-gradient(180deg,transparent_0%,rgba(50,94,106,0.16)_26%,rgba(24,64,82,0.26)_100%)] [clip-path:polygon(0_70%,8%_50%,16%_64%,24%_42%,32%_66%,41%_36%,50%_58%,59%_30%,68%_60%,77%_38%,86%_62%,94%_46%,100%_64%,100%_100%,0_100%)]" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-500">AI-powered travel planner</p>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
            Plan less.
            <br />
            Experience more.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Tell us three things and we&apos;ll craft your perfect trip in under a minute.
          </p>

          <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
            {[
              {
                type: 'mood',
                label: 'Mood',
                value: wizardState.mood.length ? wizardState.mood.join(' + ') : 'Mood',
                prompt: 'How do you want to feel?',
                icon: '≋',
                gradient: 'from-[#0e7aa4] to-[#0b5f83]',
                unlocked: true,
                selected: wizardState.mood.length > 0,
              },
              {
                type: 'duration',
                label: 'Duration',
                value: wizardState.duration || 'Duration',
                prompt: 'How long do you have?',
                icon: '▣',
                gradient: 'from-[#3cb777] to-[#2b9b67]',
                unlocked: buttonState.showDuration,
                selected: Boolean(wizardState.duration),
              },
              {
                type: 'radius',
                label: 'Radius',
                value: wizardState.radius || 'Radius',
                prompt: 'How far do you want to go?',
                icon: '⌖',
                gradient: 'from-[#ff9424] to-[#ff7c12]',
                unlocked: buttonState.showRadius,
                selected: Boolean(wizardState.radius),
              },
            ].map((card) => {
              const active = buttonState.dominant === card.type;

              return (
                <button
                  key={card.type}
                  type="button"
                  disabled={!card.unlocked}
                  onClick={() => handleButtonClick(card.type)}
                  onMouseDown={() => handleButtonMouseDown(card.type)}
                  onMouseUp={() => handleButtonMouseUp(card.type)}
                  onMouseLeave={() => handleButtonMouseLeave(card.type)}
                  onTouchStart={() => handleButtonTouchStart(card.type)}
                  onTouchEnd={() => handleButtonTouchEnd(card.type)}
                  className={`group relative flex h-[270px] flex-col items-center overflow-hidden rounded-[2rem] p-6 text-center text-white shadow-[0_22px_40px_rgba(15,23,42,0.18)] transition duration-300 bg-gradient-to-br ${card.gradient} ring-1 ring-white/15 ${
                    active ? 'scale-[1.02]' : 'hover:-translate-y-1 hover:scale-[1.01]'
                  } ${card.selected ? 'ring-4 ring-white/28' : ''} ${card.unlocked ? '' : 'cursor-not-allowed opacity-75'}`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18)_0%,transparent_45%)]" />
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white/92 text-3xl text-slate-900 shadow-[0_18px_30px_rgba(15,23,42,0.18)]">
                    {card.icon}
                  </div>

                  <div className="relative z-10 mt-8 space-y-3">
                    <div>
                      <p className="text-2xl font-semibold tracking-[-0.03em]">{card.label}</p>
                      <p className="mt-3 text-lg font-medium text-white/88">{card.prompt}</p>
                    </div>
                  </div>

                  <div className="relative z-10 mt-auto text-4xl font-light text-white/90 transition-transform group-hover:translate-y-0.5">
                    →
                  </div>
                </button>
              );
            })}
          </div>

          {(wizardState.mood.length || wizardState.duration || wizardState.radius) ? (
            <div className="mt-8 w-full max-w-4xl">
              <TripBriefChips
                wizardState={wizardState}
                onChipClick={(type) => setSheetMode(type)}
              />
            </div>
          ) : null}

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleAutoGenerate}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#0f5d7a] px-8 py-4 text-base font-semibold text-white shadow-[0_16px_32px_rgba(15,93,122,0.28)] transition hover:bg-[#0d5270] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-xl">✦</span>
              {isGenerating ? 'Creating your itinerary...' : 'Generate My Itinerary'}
            </button>
            <SurpriseMeButton />
            <button
              type="button"
              onClick={handleOpenExtendedWizard}
              className="inline-flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.08)] transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="text-xl">⋯</span>
              Full Wizard
            </button>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Long press any option to open the advanced settings.
          </p>

          {generationState === 'error' && (
            <div className="mt-8 w-full rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-left">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-900">Generation failed</p>
                  <p className="mt-1 text-sm text-amber-800">Review your selections above, then try generating again.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleAutoGenerate}
                    className="rounded-full bg-amber-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
                  >
                    Retry generation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGenerationState('idle');
                      setExtendedMode(false);
                      resetGeolocation();
                      setSheetMode('mood');
                    }}
                    className="rounded-full border border-amber-200 bg-white px-5 py-3 text-sm font-semibold text-amber-900 transition hover:border-amber-300"
                  >
                    Edit parameters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

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
                    ? 'border-ocean-deep bg-sky-50 text-slate-950 shadow-[0_16px_30px_rgba(26,107,138,0.12)] ring-2 ring-ocean-deep/15'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-2xl ${
                    wizardState.mood.includes(option.value)
                      ? 'bg-ocean-deep/10 text-ocean-deep'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {option.value === 'Relax' && '🏖️'}
                    {option.value === 'Adventure' && '🏔️'}
                    {option.value === 'Culture' && '🏛️'}
                    {option.value === 'Food' && '🍽️'}
                    {option.value === 'Nature' && '🌲'}
                    {option.value === 'Nightlife' && '🌙'}
                  </div>
                </div>
                <p className="font-semibold text-lg">{option.label}</p>
                <p className={`mt-2 text-sm ${wizardState.mood.includes(option.value) ? 'text-slate-600' : 'text-slate-500'}`}>
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
                    ? 'border-forest-trail bg-emerald-50 text-slate-950 shadow-[0_16px_30px_rgba(46,158,107,0.12)] ring-2 ring-forest-trail/15'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-2xl ${
                        wizardState.duration === option.value
                          ? 'bg-forest-trail/10 text-forest-trail'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {option.value === 'A few hours' && '☀️'}
                        {option.value === '1 Day' && '🌅'}
                        {option.value === '2–3 Days' && '🏖️'}
                        {option.value === '1 Week+' && '🗺️'}
                      </div>
                    </div>
                    <p className="font-semibold text-lg">{option.label}</p>
                    <p className={`mt-2 text-sm ${wizardState.duration === option.value ? 'text-slate-600' : 'text-slate-500'}`}>
                      {option.description}
                    </p>
                  </div>
                  {wizardState.duration === option.value && (
                    <div className="text-2xl text-forest-trail">✓</div>
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
                      ? 'border-sunset-gold bg-orange-50 text-slate-950 shadow-[0_16px_30px_rgba(244,123,32,0.12)] ring-2 ring-sunset-gold/15'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-2xl ${
                          wizardState.radius === option.value
                            ? 'bg-sunset-gold/10 text-sunset-gold'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {option.value === '< 50 km' && '🏠'}
                          {option.value === '50–150 km' && '🚗'}
                          {option.value === '150–300 km' && '✈️'}
                          {option.value === '300–500 km' && '🚄'}
                          {option.value === 'Anywhere' && '🌍'}
                        </div>
                      </div>
                      <p className="font-semibold text-lg">{option.label}</p>
                      <p className={`mt-2 text-sm ${wizardState.radius === option.value ? 'text-slate-600' : 'text-slate-500'}`}>
                        {option.description}
                      </p>
                    </div>
                    {wizardState.radius === option.value && (
                      <div className="text-2xl text-sunset-gold">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {sheetMode === 'wizard' && (
          <ExtendedWizard
            initialData={wizardState}
            onSubmit={handleExtendedWizardSubmit}
            onClose={() => {
              setSheetMode(null);
              setExtendedMode(false);
              resetGeolocation();
            }}
          />
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
