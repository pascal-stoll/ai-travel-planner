import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/trips', label: 'My Trips', icon: '📚' },
  ];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/70 bg-white/82 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-deep via-[#155a74] to-sunset-gold shadow-[0_12px_24px_rgba(26,107,138,0.22)]">
              <span className="text-lg">✈</span>
            </div>
            <div className="leading-tight">
              <span className="block text-[1.45rem] font-semibold tracking-[-0.04em] text-slate-950">TravelMind</span>
              <span className="block text-xs font-medium uppercase tracking-[0.24em] text-slate-500">AI-Powered Travel Planner</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
