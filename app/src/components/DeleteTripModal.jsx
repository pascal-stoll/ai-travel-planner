import React, { useEffect } from 'react';

export function DeleteTripModal({ open, destinationName, onCancel, onConfirm }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-950">Delete this trip?</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Are you sure you want to remove &quot;{destinationName || 'this trip'}&quot; from your trips?
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Delete Trip
          </button>
        </div>
      </div>
    </div>
  );
}
