import React from 'react';

export function DayCardAccordion({ day, open, onToggle, children, compact = false }) {
  return (
    <section className={`rounded-[2rem] border border-slate-200 bg-white shadow-sm ${compact ? 'overflow-hidden' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-4 text-left ${compact ? 'px-4 py-3' : 'px-5 py-4'}`}
      >
        <div>
          <p className={`font-semibold uppercase tracking-[0.18em] text-[#1A6B8A] ${compact ? 'text-[0.72rem]' : 'text-sm'}`}>{day.title}</p>
          <p className={`mt-1 text-slate-500 ${compact ? 'text-xs' : 'text-sm'}`}>{day.stops.length} stops planned</p>
        </div>
        <span className={`text-2xl transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {open ? <div className={`border-t border-slate-200 ${compact ? 'px-4 py-4' : 'px-5 py-5'}`}>{children}</div> : null}
    </section>
  );
}
