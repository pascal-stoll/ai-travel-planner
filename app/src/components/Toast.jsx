import React from 'react';

export function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-3xl border border-slate-200 bg-slate-950 px-5 py-4 text-sm text-slate-50 shadow-xl shadow-slate-900/10">
      <div className="flex items-center gap-3">
        <span className="flex-1">{message}</span>
        <button type="button" onClick={onClose} className="rounded-full bg-white/10 px-2 py-1 text-xs text-white transition hover:bg-white/20">
          Dismiss
        </button>
      </div>
    </div>
  );
}
