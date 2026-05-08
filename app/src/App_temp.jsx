import Navigation from './components/Navigation.jsx';

function App() {
  return (
    <TravelProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navigation />
        <main className="pt-16"> {/* Account for fixed navigation */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/trips" element={<MyTripsPage />} />
          </Routes>
        </main>
      </div>
    </TravelProvider>
  );
}

export default App;