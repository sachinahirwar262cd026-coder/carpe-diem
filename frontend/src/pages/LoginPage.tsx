import React, { useState } from 'react';
import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Radio,
  Eye,
  EyeOff,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Wind,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to Dashboard
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both Email/Mobile and Password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      const result = login(identifier, password);
      setIsSubmitting(false);

      if (!result.success) {
        setErrorMessage(result.message || 'Invalid credentials. Please verify your Email or Password.');
      } else {
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
        navigate(from, { replace: true });
      }
    }, 500);
  };

  const handleDemoClick = (role: 'officer' | 'citizen') => {
    demoLogin(role);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl relative z-10">
        {/* Top Header & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold mb-3 shadow-sm">
            <Radio className="w-3.5 h-3.5 animate-pulse text-teal-400" />
            <span>Smart India Hackathon 2026 · Team Carpe diem (NIT Surathkal)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Intelligent Air and Noise Pollution Monitoring and Prediction
          </h1>
          <p className="mt-2 text-sm sm:text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400">
            “Monitor. Predict. Protect.”
          </p>
        </div>

        {/* Main Card Container with 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Visual Project Highlights & Quick Demo Logins */}
          <div className="lg:col-span-5 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-teal-500/20 mb-6">
                🔐
              </div>

              <h2 className="text-xl font-extrabold text-white">
                Access Environmental Intelligence Portal
              </h2>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Log in to access live continuous ambient telemetry, LSTM predictions, noise hotspot clusters, and citizen complaint dispatch pipelines.
              </p>

              <div className="mt-6 space-y-3">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center space-x-3 text-xs">
                  <Wind className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="text-slate-300">CPCB & OpenWeather Continuous Data Fusion</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center space-x-3 text-xs">
                  <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-300">CORTN Traffic Noise Decibel Estimation</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center space-x-3 text-xs">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-slate-300">LLM Autonomous Authority Action Dossier</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Logins for Judges & Evaluators */}
            <div className="mt-8 pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Evaluator Demo Login:
              </span>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoClick('officer')}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 text-xs font-bold transition border border-teal-500/30 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3.5 h-3.5 text-teal-400" />
                    <span>Dr. Anjali Sharma (CPCB Officer)</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoClick('citizen')}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Lokesh Satiwada (Citizen Inspector)</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-lg font-black text-white">Sign In to Your Account</h3>
                  <p className="text-xs text-slate-400">Enter your credentials to continue</p>
                </div>
                <Link
                  to="/register"
                  className="text-xs font-bold text-teal-400 hover:text-teal-300 hover:underline flex items-center space-x-1"
                >
                  <span>New user? Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start space-x-2.5 text-xs text-rose-300 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email or Mobile */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email ID or Mobile Number
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. anjali.sharma@cpcb.gov.in or 9876543210"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-teal-500 focus:outline-none text-slate-100 placeholder-slate-500 text-xs font-medium transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-teal-500 focus:outline-none text-slate-100 placeholder-slate-500 text-xs font-medium transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-sm transition-all duration-200 shadow-xl shadow-teal-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Verifying Session...</span>
                  ) : (
                    <>
                      <span>Login to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>National Environmental Monitoring Portal</span>
              <Link to="/register" className="text-teal-400 font-bold hover:underline">
                Create Account →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
