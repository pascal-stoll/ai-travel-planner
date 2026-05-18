import React, { useRef, useState } from 'react';
import { TripHistoryCard } from './TripHistoryCard.jsx';

const DELETE_THRESHOLD = -80;
const MAX_SWIPE = -120;

export function SwipeableTripCard({ trip, onDelete, onClick }) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const startXRef = useRef(null);

  const handleTouchStart = (event) => {
    startXRef.current = event.touches[0].clientX;
  };

  const handleTouchMove = (event) => {
    if (startXRef.current === null) return;

    const delta = event.touches[0].clientX - startXRef.current;
    setSwipeOffset(Math.min(0, Math.max(delta, MAX_SWIPE)));
  };

  const handleTouchEnd = () => {
    const shouldDelete = swipeOffset <= DELETE_THRESHOLD;
    setSwipeOffset(0);
    startXRef.current = null;

    if (shouldDelete) {
      onDelete?.(trip.id);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[1.75rem]">
      <div className="absolute inset-0 flex items-center justify-end rounded-[1.75rem] bg-rose-600 px-6 text-white">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div
        className="relative transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <TripHistoryCard trip={trip} onDelete={onDelete} onClick={onClick} />
      </div>
    </div>
  );
}
