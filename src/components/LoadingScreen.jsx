import React from 'react';

export function LoadingScreen({ message = 'Generating your itinerary…' }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
      <div className="mb-5 h-16 w-16 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
      <p className="max-w-xl text-base leading-7 text-slate-700">{message}</p>
    </div>
  );
}
