import {
  moodOptions,
  durationOptions,
  radiusOptions,
  budgetOptions,
  transportModes,
} from '../../utils/constants.js';

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomMulti(arr, min = 1) {
  const count = Math.floor(Math.random() * (arr.length - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Generates a random but valid combination of all wizard parameters.
 * Values are sourced exclusively from constants.js to stay aligned with
 * the options displayed in the UI.
 * @returns {Object} randomised wizard params compatible with generateItineraryForWizard
 */
export function generateRandomWizardParams() {
  return {
    mood: pickRandomMulti(moodOptions.map((o) => o.value), 1),
    duration: pickRandom(durationOptions.map((o) => o.value)),
    radius: pickRandom(radiusOptions.map((o) => o.value)),
    budget: pickRandom(budgetOptions),
    adults: Math.floor(Math.random() * 4) + 1,
    children: Math.floor(Math.random() * 3),
    transport: pickRandomMulti(transportModes, 1),
    location: { label: 'Your location', coords: null },
    source: 'surprise-me',
  };
}
