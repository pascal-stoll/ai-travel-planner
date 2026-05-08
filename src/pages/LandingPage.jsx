import { Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext.jsx';

function LandingPage() {
  const { wizardState } = useTravel();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 grid gap-6 rounded-[2rem] bg-white/90 p-10 shadow-card backdrop-blur-xl">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">AI-powered itinerary builder</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">From mood to map in under a minute.</h1>
          <p className="max-w-2xl text-lg text-slate-600 sm:text-xl">Choose your vibe, set your tempo, and TravelMind builds a personalised itinerary with map, timeline, and travel logic.</p>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Mood</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{wizardState.mood.length ? wizardState.mood.join(', ') : 'Choose your mood'}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Duration</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{wizardState.duration || 'Pick a trip length'}</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Radius</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{wizardState.radius || 'Set distance'}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800" type="button">Surprise Me</button>
            <Link to="/trips" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
              My Trips
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-6 rounded-[2rem] bg-white/90 p-8 shadow-card backdrop-blur-xl sm:p-10">
        <h2 className="text-2xl font-semibold text-slate-950">Fast-path planning</h2>
        <p className="max-w-2xl text-slate-600">Tap the three selectors to build a quick travel brief, or open the full wizard when you want more control.</p>
      </section>
    </main>
  );
}

export default LandingPage;
