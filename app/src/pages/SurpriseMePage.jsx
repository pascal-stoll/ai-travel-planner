import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravel } from '../context/useTravel.js';
import { generateRandomWizardParams } from '../features/results/surpriseMe.js';
import { generateItineraryForWizard } from '../features/results/generateItinerary.js';
import LoadingScreen from '../components/LoadingScreen.jsx';

export function SurpriseMePage() {
  const navigate = useNavigate();
  const { setWizardState, saveTrip } = useTravel();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    const params = generateRandomWizardParams();

    setWizardState({
      mood: params.mood,
      duration: params.duration,
      radius: params.radius,
      budget: params.budget,
      adults: params.adults,
      children: params.children,
      transport: params.transport,
      location: params.location,
    });

    generateItineraryForWizard(params)
      .then((result) => {
        if (!result?.itinerary) {
          throw new Error('Surprise itinerary generation returned no itinerary.');
        }
        saveTrip(result.itinerary);
        navigate('/results');
      })
      .catch(() => {
        navigate('/');
      });
  }, [navigate, saveTrip, setWizardState]);

  return (
    <LoadingScreen
      moodLabel={null}
      durationLabel={null}
      radiusLabel="Surprise Me!"
    />
  );
}

export default SurpriseMePage;
