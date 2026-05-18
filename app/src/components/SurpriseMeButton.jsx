import React from 'react';
import { useNavigate } from 'react-router-dom';

export function SurpriseMeButton() {
  const navigate = useNavigate();

  const handleSurpriseMe = () => {
    navigate('/surprise-me');
  };

  return (
    <button
      type="button"
      onClick={handleSurpriseMe}
      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.08)] transition hover:border-slate-300 hover:bg-slate-50"
      aria-label="Surprise Me - generate a random trip instantly"
    >
      Surprise Me
    </button>
  );
}
