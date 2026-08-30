import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Radio,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Wind,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RegisterPage: React.FC = () => {
  const { isAuthenticated, register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to Dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Real-time validation rules
  const validate = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    // 10-digit Indian mobile validation (starts with 6, 7, 8, or 9)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\d+$/.test(formData.mobile.trim())) {
      errors.mobile = 'Mobile number must contain digits only';
    } else if (formData.mobile.trim().length !== 10) {
      errors.mobile = 'Mobile number must be exactly 10 digits';
    } else if (!mobileRegex.test(formData.mobile.trim())) {
      errors.mobile = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email ID is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation (at least 8 characters)
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const errors = validate();

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      name: true,
      mobile: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const currentErrors = validate();
    if (Object.keys(currentErrors).length > 0) {
      setErrorMessage('Please correct the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await register({
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Registration failed. Please try again.');
    } else {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      navigate('/');
    }
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
          {/* Left Column: Visual System Highlights */}
          <div className="lg:col-span-5 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-teal-500/20 mb-6">
                🌿
              </div>

              <h2 className="text-xl font-extrabold text-white">
                Join India's AI Environmental Grid
              </h2>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Empowering citizens and municipal authorities with neighborhood-level 24-hour AQI forecasts and acoustic decibel surveillance.
              </p>

              <div className="mt-6 space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 mt-0.5">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">LSTM 24h Air Prediction</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hourly micro-pocket forecasts and automated asthma health advisories.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mt-0.5">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">CORTN Traffic Noise AI</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Real-time street sound pressure calculation without physical mic arrays.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Citizen Credibility System</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Audio Mel-spectrogram evidence verification for rapid municipal action.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Login Option */}
            <div className="mt-8 pt-4 border-t border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Evaluating as a Judge / Reviewer?
              </span>
              <button
                type="button"
                onClick={() => {
                  demoLogin('officer');
                  navigate('/');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold transition border border-slate-700 flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Instant Demo Login (Dr. Anjali Sharma)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-lg font-black text-white">Create New Account</h3>
                  <p className="text-xs text-slate-400">Join the SIH 2026 Environmental Portal</p>
                </div>
                <Link
                  to="/login"
                  className="text-xs font-bold text-teal-400 hover:text-teal-300 hover:underline flex items-center space-x-1"
                >
                  <span>Already registered? Log in</span>
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
                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Lokesh Satiwada"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={() => handleBlur('name')}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border text-slate-100 placeholder-slate-500 text-xs font-medium focus:outline-none transition ${
                        touched.name && errors.name
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-slate-800 focus:border-teal-500'
                      }`}
                    />
                  </div>
                  {touched.name && errors.name && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* 2. Mobile & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mobile */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Mobile Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        name="mobile"
                        required
                        maxLength={10}
                        placeholder="10-digit Indian Mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        onBlur={() => handleBlur('mobile')}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border text-slate-100 placeholder-slate-500 text-xs font-medium focus:outline-none transition ${
                          touched.mobile && errors.mobile
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-slate-800 focus:border-teal-500'
                        }`}
                      />
                    </div>
                    {touched.mobile && errors.mobile && (
                      <p className="text-[11px] text-rose-400 mt-1">{errors.mobile}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Email ID <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="e.g. name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email')}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border text-slate-100 placeholder-slate-500 text-xs font-medium focus:outline-none transition ${
                          touched.email && errors.email
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-slate-800 focus:border-teal-500'
                        }`}
                      />
                    </div>
                    {touched.email && errors.email && (
                      <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* 3. Password & Confirm Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Password (min 8 chars) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border text-slate-100 placeholder-slate-500 text-xs font-medium focus:outline-none transition ${
                          touched.password && errors.password
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-slate-800 focus:border-teal-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="text-[11px] text-rose-400 mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Confirm Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        required
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border text-slate-100 placeholder-slate-500 text-xs font-medium focus:outline-none transition ${
                          touched.confirmPassword && errors.confirmPassword
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-slate-800 focus:border-teal-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-sm transition-all duration-200 shadow-xl shadow-teal-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Creating Your Environmental Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration & Launch Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-400">
              <span>By registering, you agree to CPCB citizen telemetry participation guidelines.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
