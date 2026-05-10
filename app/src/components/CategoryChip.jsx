import React from 'react';

const CATEGORY_STYLES = {
  restaurant: 'bg-[#F47B20]/15 text-[#8A3E00] ring-[#F47B20]/20',
  museum: 'bg-[#1A6B8A]/15 text-[#0F4F68] ring-[#1A6B8A]/20',
  nature: 'bg-[#2E9E6B]/15 text-[#1E6B49] ring-[#2E9E6B]/20',
  landmark: 'bg-slate-900/10 text-slate-800 ring-slate-900/10',
  activity: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function CategoryChip({ category }) {
  const key = CATEGORY_STYLES[category] ? category : 'activity';
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ring-1 ${CATEGORY_STYLES[key]}`}>
      {key}
    </span>
  );
}
