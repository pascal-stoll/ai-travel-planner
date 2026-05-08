import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import MyTripsPage from './pages/MyTripsPage.jsx';
import { TravelProvider } from './context/TravelContext.jsx';

function App() {
  return (
    <TravelProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/trips" element={<MyTripsPage />} />
          </Routes>
        </div>
      </Router>
    </TravelProvider>
  );
}

export default App;
