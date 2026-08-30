import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
        <Compass className="w-8 h-8 animate-spin" />
      </div>
      <h2 className="text-3xl font-black text-white">404 - Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-md leading-relaxed">
        The requested environmental telemetry route does not exist. Please return to the main dashboard.
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-teal-500/20"
      >
        <Home className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
};
