import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useApp } from '../../context/AppContext';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useApp();

  useEffect(() => {
    // Add theme class to document body
    document.body.className = `theme-${theme} font-sans min-h-screen antialiased selection:bg-teal-500 selection:text-white transition-colors duration-300`;
  }, [theme]);

  const getThemeBackground = () => {
    switch (theme) {
      case 'deep-forest':
        return 'bg-[#021b16] text-emerald-100';
      case 'cyber-neon':
        return 'bg-[#030712] text-cyan-100';
      case 'dark-slate':
        return 'bg-slate-950 text-slate-100';
      default:
        return 'bg-slate-50 text-slate-900';
    }
  };

  const getGlowGradients = () => {
    switch (theme) {
      case 'deep-forest':
        return (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-green-600/15 rounded-full blur-3xl" />
          </>
        );
      case 'cyber-neon':
        return (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl" />
          </>
        );
      case 'clean-light':
        return (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-200/25 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-200/25 rounded-full blur-3xl" />
          </>
        );
      default:
        return (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          </>
        );
    }
  };

  return (
    <div className={`min-h-screen ${getThemeBackground()} flex flex-col font-sans transition-colors duration-300`}>
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {getGlowGradients()}
      </div>

      {/* Responsive Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col relative z-10">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};
