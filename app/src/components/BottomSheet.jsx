import React, { useEffect, useState } from 'react';

export function BottomSheet({ title, open, onClose, children, extendedContent, showExtended }) {
  const [activeTab, setActiveTab] = useState('main');

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    setActiveTab('main');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4 pt-24 md:items-center md:pt-4">
      <div className="flex h-[min(78vh,44rem)] w-full max-w-[42rem] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-200" onClick={handleClose}>
            Close
          </button>
        </div>
        
        {/* Tab Navigation */}
        {showExtended && (
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('main')}
              className={`flex-1 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === 'main' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Quick Select
            </button>
            <button
              onClick={() => setActiveTab('extended')}
              className={`flex-1 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === 'extended' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Extended Options
            </button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {activeTab === 'main' ? children : extendedContent}
        </div>
      </div>
    </div>
  );
}
