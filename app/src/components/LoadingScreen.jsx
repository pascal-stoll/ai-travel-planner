import { useState, useEffect } from 'react';
import './LoadingScreen.css';
import TripChip from './TripChip';

const STATUS_MESSAGES = [
  'Crafting your perfect itinerary…',
  'Discovering hidden gems for you…',
  'Matching your vibe to destinations…',
  'Almost there — finalising details…'
];

const Compass = () => (
  <svg
    className="compass"
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="32" cy="32" r="28" stroke="var(--color-ocean-deep)" strokeWidth="3" />
    <line x1="32" y1="8" x2="32" y2="20" stroke="var(--color-ocean-deep)" strokeWidth="3" strokeLinecap="round" />
    <line x1="32" y1="44" x2="32" y2="56" stroke="var(--color-ocean-deep)" strokeWidth="3" strokeLinecap="round" />
    <line x1="8" y1="32" x2="20" y2="32" stroke="var(--color-ocean-deep)" strokeWidth="3" strokeLinecap="round" />
    <line x1="44" y1="32" x2="56" y2="32" stroke="var(--color-ocean-deep)" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="32" r="4" fill="var(--color-ocean-deep)" />
    <path
      d="M32 14 L36 28 L32 24 Z"
      fill="var(--color-ocean-deep)"
      className="compass__needle"
      style={{ transformOrigin: '32px 32px' }}
    />
  </svg>
);

const LoadingScreen = ({ moodLabel, durationLabel, radiusLabel }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
        setFading(false);
      }, 400);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-screen__content">
        <div className="loading-screen__chips" aria-label="Your travel brief">
          {moodLabel && <TripChip label={moodLabel} color="#1A6B8A" />}
          {durationLabel && <TripChip label={durationLabel} color="#2E9E6B" />}
          {radiusLabel && <TripChip label={radiusLabel} color="#F47B20" />}
        </div>
        <Compass />
        <p
          className={`loading-screen__status ${fading ? 'loading-screen__status--fade' : ''}`}
          aria-live="polite"
        >
          {STATUS_MESSAGES[messageIndex]}
        </p>
        <div className="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="Loading progress">
          <div className="progress-bar__indicator" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
