import React, { useState } from 'react';
import { budgetOptions, durationOptions, moodOptions, radiusOptions, transportModes } from '../utils/constants.js';

const STEP_IDS = ['tripType', 'location', 'duration', 'budget', 'travellerGroup', 'transport', 'review'];

const STEP_META = {
  tripType: { title: 'Trip Type', description: 'Choose one or more travel moods.' },
  location: { title: 'Location + Distance', description: 'Tell us where you are starting from and how far to go.' },
  duration: { title: 'Duration', description: 'Pick the length of the trip.' },
  budget: { title: 'Budget', description: 'Set the budget tier for the trip.' },
  travellerGroup: { title: 'Traveller Group', description: 'Tell us who is going.' },
  transport: { title: 'Transport Mode', description: 'Select the transport modes you want to use.' },
  review: { title: 'Review & Confirm', description: 'Check everything before generating the itinerary.' },
};

function toInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeRadiusValue(value = '') {
  const text = String(value).trim();
  if (!text) return '';
  if (text === 'Anywhere') return 'Anywhere';
  return text;
}

function createInitialData(initialData = {}) {
  return {
    tripType: Array.isArray(initialData.tripType)
      ? initialData.tripType.filter(Boolean)
      : Array.isArray(initialData.mood)
        ? initialData.mood.filter(Boolean)
        : [],
    location: {
      cityName: initialData.location?.cityName || initialData.location?.label || initialData.cityName || '',
      radiusChoice: normalizeRadiusValue(initialData.location?.radiusChoice || initialData.radius || ''),
      customRadiusKm: initialData.location?.radiusKm ? String(initialData.location.radiusKm) : '',
    },
    duration: initialData.duration || '',
    budget: initialData.budget || 'Mid-Range',
    travellerGroup: {
      adults: Number.isFinite(Number(initialData.travellerGroup?.adults))
        ? Math.max(1, Number(initialData.travellerGroup.adults))
        : Number.isFinite(Number(initialData.adults))
          ? Math.max(1, Number(initialData.adults))
          : 2,
      children: Number.isFinite(Number(initialData.travellerGroup?.children))
        ? Math.max(0, Number(initialData.travellerGroup.children))
        : Number.isFinite(Number(initialData.children))
          ? Math.max(0, Number(initialData.children))
          : 0,
    },
    transportModes: Array.isArray(initialData.transportModes)
      ? initialData.transportModes.filter(Boolean)
      : Array.isArray(initialData.transport)
        ? initialData.transport.filter(Boolean)
        : ['Car'],
  };
}

function isRadiusValid(location) {
  if (!location) return false;
  if (location.radiusChoice === 'Anywhere') return true;
  if (radiusOptions.some((option) => option.value === location.radiusChoice)) return true;
  const customRadius = Number(location.customRadiusKm);
  return Number.isFinite(customRadius) && customRadius > 0;
}

function validateStep(stepId, draft) {
  switch (stepId) {
    case 'tripType':
      return draft.tripType.length > 0 ? '' : 'Please select at least one travel style.';
    case 'location':
      if (!draft.location.cityName.trim()) return 'Please enter a departure city.';
      if (!isRadiusValid(draft.location)) return 'Please select a valid radius or enter a custom distance.';
      return '';
    case 'duration':
      return draft.duration ? '' : 'Please select a travel duration.';
    case 'budget':
      return draft.budget ? '' : 'Please select a budget tier.';
    case 'travellerGroup':
      if (draft.travellerGroup.adults < 1) return 'At least one adult is required.';
      if (draft.travellerGroup.children < 0) return 'Children cannot be negative.';
      return '';
    case 'transport':
      return draft.transportModes.length > 0 ? '' : 'Please select at least one transport mode.';
    default:
      return '';
  }
}

function buildSubmitPayload(draft) {
  const radiusChoice = normalizeRadiusValue(draft.location.radiusChoice);
  const customRadiusKm = Number(draft.location.customRadiusKm);
  const radiusKm = Number.isFinite(customRadiusKm) && customRadiusKm > 0 ? customRadiusKm : null;

  return {
    source: 'extended-wizard',
    tripType: draft.tripType,
    mood: draft.tripType,
    location: {
      cityName: draft.location.cityName.trim(),
      radiusChoice,
      radiusKm,
      label: draft.location.cityName.trim(),
      coords: null,
    },
    duration: draft.duration,
    budget: draft.budget,
    travellerGroup: draft.travellerGroup,
    adults: draft.travellerGroup.adults,
    children: draft.travellerGroup.children,
    transportModes: draft.transportModes,
    transport: draft.transportModes,
    radius: radiusChoice === 'Anywhere'
      ? 'Anywhere'
      : radiusKm
        ? `${radiusKm} km`
        : radiusChoice,
  };
}

function StepHeader({ index, total, title, description }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        Step {index + 1} of {total}
      </p>
      <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}

function SelectChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        active
          ? 'border-slate-900 bg-slate-950 text-white shadow-[0_16px_28px_rgba(15,23,42,0.16)]'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function ReviewSection({ title, value, onEdit }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition hover:border-slate-300"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export function ExtendedWizard({ initialData, onSubmit, onClose }) {
  const [draft, setDraft] = useState(() => createInitialData(initialData));
  const [stepIndex, setStepIndex] = useState(0);
  const [attemptedStep, setAttemptedStep] = useState(null);
  const [touchedSteps, setTouchedSteps] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepId = STEP_IDS[stepIndex];
  const currentStepError = validateStep(currentStepId, draft);
  const showCurrentError = Boolean(currentStepError) && (attemptedStep === currentStepId || touchedSteps[currentStepId]);
  const isCurrentStepValid = !currentStepError;
  const isReview = currentStepId === 'review';

  const markTouched = (stepId = currentStepId) => {
    setTouchedSteps((current) => ({ ...current, [stepId]: true }));
  };

  const updateDraft = (patch) => {
    setDraft((current) => ({ ...current, ...patch }));
    markTouched();
    setSubmitError('');
  };

  const updateLocation = (patch) => {
    setDraft((current) => ({
        ...current,
        location: {
          ...current.location,
          ...patch,
        },
      }));
    markTouched('location');
    setSubmitError('');
  };

  const updateTravellerGroup = (patch) => {
    setDraft((current) => ({
      ...current,
        travellerGroup: {
          ...current.travellerGroup,
          ...patch,
        },
      }));
    markTouched('travellerGroup');
    setSubmitError('');
  };

  const toggleMultiSelect = (key, value) => {
    setDraft((current) => {
      const selected = current[key];
      const next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      return { ...current, [key]: next };
    });
    markTouched(currentStepId);
    setSubmitError('');
  };

  const handleNext = () => {
    if (!isCurrentStepValid) {
      setAttemptedStep(currentStepId);
      return;
    }

    setAttemptedStep(null);
    if (stepIndex < STEP_IDS.length - 1) {
      setStepIndex((current) => current + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      if (onClose) onClose();
      return;
    }

    setAttemptedStep(null);
    setSubmitError('');
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const handleGoToStep = (targetStepId) => {
    const targetIndex = STEP_IDS.indexOf(targetStepId);
    if (targetIndex >= 0) {
      setStepIndex(targetIndex);
      setAttemptedStep(null);
      setSubmitError('');
    }
  };

  const handleConfirm = async () => {
    if (!STEP_IDS.slice(0, -1).every((stepId) => !validateStep(stepId, draft))) {
      const firstInvalid = STEP_IDS.find((stepId) => stepId !== 'review' && validateStep(stepId, draft));
      if (firstInvalid) {
        setStepIndex(STEP_IDS.indexOf(firstInvalid));
        setAttemptedStep(firstInvalid);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      await onSubmit(buildSubmitPayload(draft));
    } catch (error) {
      setSubmitError(error?.message || 'Failed to generate itinerary.');
      setIsSubmitting(false);
    }
  };

  const transportSummary = draft.transportModes.length ? draft.transportModes.join(', ') : 'Not selected';
  const tripTypeSummary = draft.tripType.length ? draft.tripType.join(' + ') : 'Not selected';
  const radiusSummary = draft.location.radiusChoice === 'Anywhere'
    ? 'Anywhere'
    : Number.isFinite(Number(draft.location.customRadiusKm)) && Number(draft.location.customRadiusKm) > 0
      ? `${draft.location.customRadiusKm} km`
      : draft.location.radiusChoice || 'Not selected';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Extended Wizard</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-950">{STEP_META[currentStepId].title}</p>
        </div>
        <div className="flex items-center gap-2">
          {STEP_IDS.map((stepId, index) => (
            <button
              key={stepId}
              type="button"
              onClick={() => handleGoToStep(stepId)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === stepIndex ? 'bg-slate-950' : index < stepIndex ? 'bg-forest-trail' : 'bg-slate-200'
              }`}
              aria-label={`Go to ${STEP_META[stepId].title}`}
            />
          ))}
        </div>
      </div>

      {!isReview ? (
        <div className="space-y-5">
          <StepHeader
            index={stepIndex}
            total={STEP_IDS.length}
            title={STEP_META[currentStepId].title}
            description={STEP_META[currentStepId].description}
          />

          {currentStepId === 'tripType' && (
            <div className="grid gap-3 sm:grid-cols-2">
              {moodOptions.map((option) => (
                <SelectChip
                  key={option.value}
                  active={draft.tripType.includes(option.value)}
                  onClick={() => toggleMultiSelect('tripType', option.value)}
                >
                  <span>{option.label}</span>
                </SelectChip>
              ))}
            </div>
          )}

          {currentStepId === 'location' && (
            <div className="space-y-4">
              <label className="block rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <span className="mb-2 block text-sm font-semibold text-slate-900">City Name</span>
                <input
                  value={draft.location.cityName}
                  onChange={(event) => updateLocation({ cityName: event.target.value })}
                  placeholder="Enter a departure city"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </label>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900">Distance</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {radiusOptions.map((option) => (
                    <SelectChip
                      key={option.value}
                      active={draft.location.radiusChoice === option.value}
                      onClick={() => updateLocation({ radiusChoice: option.value, customRadiusKm: '' })}
                    >
                      {option.label}
                    </SelectChip>
                  ))}
                  <SelectChip
                    active={draft.location.radiusChoice === 'Custom'}
                    onClick={() => updateLocation({ radiusChoice: 'Custom' })}
                  >
                    Custom distance
                  </SelectChip>
                </div>
                {draft.location.radiusChoice === 'Custom' ? (
                  <label className="block rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <span className="mb-2 block text-sm font-semibold text-slate-900">Custom radius in km</span>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      value={draft.location.customRadiusKm}
                      onChange={(event) => updateLocation({ customRadiusKm: event.target.value })}
                      placeholder="e.g. 150"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none"
                    />
                  </label>
                ) : null}
              </div>
            </div>
          )}

          {currentStepId === 'duration' && (
            <div className="grid gap-3">
              {durationOptions.map((option) => (
                <SelectChip
                  key={option.value}
                  active={draft.duration === option.value}
                  onClick={() => updateDraft({ duration: option.value })}
                >
                  {option.label}
                </SelectChip>
              ))}
            </div>
          )}

          {currentStepId === 'budget' && (
            <div className="grid gap-3 sm:grid-cols-2">
              {budgetOptions.map((option) => (
                <SelectChip
                  key={option}
                  active={draft.budget === option}
                  onClick={() => updateDraft({ budget: option })}
                >
                  {option}
                </SelectChip>
              ))}
            </div>
          )}

          {currentStepId === 'travellerGroup' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <span className="mb-2 block text-sm font-semibold text-slate-900">Adults</span>
                <input
                  type="number"
                  min="1"
                  value={draft.travellerGroup.adults}
                  onChange={(event) => updateTravellerGroup({ adults: Math.max(1, toInteger(event.target.value, 1)) })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </label>
              <label className="block rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <span className="mb-2 block text-sm font-semibold text-slate-900">Children</span>
                <input
                  type="number"
                  min="0"
                  value={draft.travellerGroup.children}
                  onChange={(event) => updateTravellerGroup({ children: Math.max(0, toInteger(event.target.value, 0)) })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </label>
            </div>
          )}

          {currentStepId === 'transport' && (
            <div className="grid gap-3 sm:grid-cols-2">
              {transportModes.map((option) => (
                <SelectChip
                  key={option}
                  active={draft.transportModes.includes(option)}
                  onClick={() => toggleMultiSelect('transportModes', option)}
                >
                  {option}
                </SelectChip>
              ))}
            </div>
          )}

          {showCurrentError ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              {currentStepError}
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              {currentStepId === 'tripType' && 'Select one or more travel styles.'}
              {currentStepId === 'location' && 'Enter a city and choose a distance to continue.'}
              {currentStepId === 'duration' && 'Pick one duration to keep going.'}
              {currentStepId === 'budget' && 'Choose a budget tier.'}
              {currentStepId === 'travellerGroup' && 'At least one adult is required.'}
              {currentStepId === 'transport' && 'Select at least one transport mode.'}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <StepHeader
            index={stepIndex}
            total={STEP_IDS.length}
            title={STEP_META[currentStepId].title}
            description={STEP_META[currentStepId].description}
          />

          <div className="grid gap-3">
            <ReviewSection
              title="Travel Style"
              value={tripTypeSummary}
              onEdit={() => handleGoToStep('tripType')}
            />
            <ReviewSection
              title="Location + Distance"
              value={`${draft.location.cityName || 'Not selected'} · ${radiusSummary}`}
              onEdit={() => handleGoToStep('location')}
            />
            <ReviewSection
              title="Duration"
              value={draft.duration || 'Not selected'}
              onEdit={() => handleGoToStep('duration')}
            />
            <ReviewSection
              title="Budget"
              value={draft.budget || 'Not selected'}
              onEdit={() => handleGoToStep('budget')}
            />
            <ReviewSection
              title="Traveller Group"
              value={`${draft.travellerGroup.adults} adults, ${draft.travellerGroup.children} children`}
              onEdit={() => handleGoToStep('travellerGroup')}
            />
            <ReviewSection
              title="Transport Modes"
              value={transportSummary}
              onEdit={() => handleGoToStep('transport')}
            />
          </div>

          {submitError ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
              {submitError}
            </p>
          ) : null}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={stepIndex === 0}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>

        {!isReview ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentStepValid}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-ocean-deep px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d5270] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating itinerary...' : 'Confirm'}
          </button>
        )}
      </div>
    </div>
  );
}
