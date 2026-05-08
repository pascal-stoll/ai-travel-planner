import { useTravel } from '../context/TravelContext.jsx';

function ResultsPage() {
  const { activeItinerary } = useTravel();

  if (!activeItinerary) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-lg font-semibold text-slate-900">No itinerary found.</p>
        <p className="mt-3 text-slate-600">Create a trip on the landing page and come back to see your plan.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 rounded-[2rem] bg-white/90 p-10 shadow-card backdrop-blur-xl">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Destination</p>
          <h1 className="text-4xl font-semibold text-slate-950">{activeItinerary.destination}</h1>
          <p className="max-w-3xl text-lg text-slate-600">{activeItinerary.subtitle}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Mood</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{activeItinerary.mood}</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Trip type</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{activeItinerary.duration}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ResultsPage;
