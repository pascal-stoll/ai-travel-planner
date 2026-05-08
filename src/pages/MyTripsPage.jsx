import { Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext.jsx';

function MyTripsPage() {
  const { history } = useTravel();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 rounded-[2rem] bg-white/90 p-8 shadow-card backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">My Trips</p>
          <h1 className="text-3xl font-semibold text-slate-950">Saved itineraries</h1>
        </div>
        <Link to="/" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
          Back to landing
        </Link>
      </header>

      {history.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-10 text-center shadow-card backdrop-blur-xl">
          <p className="text-lg font-semibold text-slate-950">No saved trips yet.</p>
          <p className="mt-3 text-slate-600">Create an itinerary on the landing page to save a plan here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {history.map((trip) => (
            <article key={trip.id} className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-card backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">{trip.destination}</h2>
                  <p className="mt-1 text-sm text-slate-600">{new Date(trip.generatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">{trip.duration}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">{trip.radius}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyTripsPage;
