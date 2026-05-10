import React from 'react';

export function TravelNote({ note, compact = false }) {
  if (!note) return null;

  return (
    <div className={compact ? 'pl-3 sm:pl-4' : 'pl-4 sm:pl-6'}>
      <div className={`rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-600 ${compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'}`}>
        <span className="mr-2 font-semibold text-slate-900">Travel</span>
        {note}
      </div>
    </div>
  );
}
