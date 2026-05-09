import React, { useState } from 'react';

export function BottomSheet({ title, open, onClose, children, extendedContent, showExtended }) {
  const [activeTab, setActiveTab] = useState('main');
  
  if (!open) return null;
  
  const handleClose = () => {
    setActiveTab('main');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 md:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
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
        
        <div className="max-h-[80vh] overflow-y-auto px-5 py-4">
          {activeTab === 'main' ? children : extendedContent}
        </div>
      </div>
    </div>
  );
}
