import { useState } from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children, className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen ${className}`}>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="p-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="float-right p-2 rounded-lg hover:bg-slate-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <nav className="mt-8 space-y-4">
                <Link to="/" className="block px-4 py-2 text-slate-dark hover:bg-slate-50 rounded-lg">
                  🏠 Home
                </Link>
                <Link to="/trips" className="block px-4 py-2 text-slate-dark hover:bg-slate-50 rounded-lg">
                  📚 My Trips
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default Layout;