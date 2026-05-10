import { useRef, useState } from 'react';
import './StopDetailSheet.css';

const StopDetailSheet = ({ stop, stopIndex, onClose }) => {
  const [swiping, setSwiping] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const sheetRef = useRef(null);

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    setSwiping(false);
  };

  const handleTouchMove = (e) => {
    const delta = e.touches[0].clientY - startY.current;
    currentY.current = delta;
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
      setSwiping(true);
    }
  };

  const handleTouchEnd = () => {
    if (currentY.current > 80) {
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)';
    }
    setSwiping(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!stop) return null;

  const categoryClass = `stop-detail-category--${stop.category || 'landmark'}`;

  return (
    <div className="stop-detail-overlay" onClick={handleOverlayClick}>
      <div
        className="stop-detail-sheet"
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="stop-detail-sheet__handle" />
        <div className="stop-detail-header">
          <div className="stop-detail-badge">{stopIndex + 1}</div>
          <h2 className="stop-detail-name">{stop.name}</h2>
        </div>
        <span className={`stop-detail-category ${categoryClass}`}>{stop.category}</span>
        <div className="stop-detail-times">
          <span>🕒 {stop.arrivalTime}</span>
          <span>⏱ {stop.durationMinutes} min</span>
        </div>
        <p className="stop-detail-description">{stop.description}</p>
        <button className="regenerate-btn" onClick={() => {}}>
          Regenerate Stop
        </button>
      </div>
    </div>
  );
};

export default StopDetailSheet;
