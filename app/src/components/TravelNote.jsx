import React from 'react';

export function TravelNote({ note }) {
  if (!note) return null;

  return (
    <div className="pl-4 sm:pl-6">
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <span className="mr-2 font-semibold text-slate-900">Travel</span>
        {note}
      </div>
    </div>
  );
}
