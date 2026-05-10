import React from 'react';

export function DayCardAccordion({ day, open, onToggle, children }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1A6B8A]">{day.title}</p>
          <p className="mt-1 text-sm text-slate-500">{day.stops.length} stops planned</p>
        </div>
        <span className={`text-2xl transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {open ? <div className="border-t border-slate-200 px-5 py-5">{children}</div> : null}
    </section>
  );
}
