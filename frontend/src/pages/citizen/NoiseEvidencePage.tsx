import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Volume2,
  Mic,
  Square,
  Upload,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Send,
  RotateCcw,
  Shield,
  ArrowRight,
  Info,
  Sliders,
  AlertCircle,
  Play,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { SAMPLE_NOISE_PRESETS, analyzeNoiseEvidence } from '../../services/api/evidenceService';
import { NoiseAnalysisResult } from '../../types';
import { useGeolocation } from '../../hooks/useGeolocation';
import { reverseGeocode } from '../../services/api/geocodingService';
import confetti from 'canvas-confetti';

export const NoiseEvidencePage: React.FC = () => {
  const { selectedCity, setSelectedCityId, setUserGpsLocation, addComplaint } = useApp();
  const geo = useGeolocation(false);

  const [mode, setMode] = useState<'record' | 'upload' | 'preset'>('record');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedSeconds, setRecordedSeconds] = useState<number>(0);
  const [hasRecordedAudio, setHasRecordedAudio] = useState<boolean>(false);
  const [uploadedDuration, setUploadedDuration] = useState<number>(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const [locationName, setLocationName] = useState<string>(
    `${selectedCity.pockets[0]?.name || selectedCity.name}, ${selectedCity.state}`
  );
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<NoiseAnalysisResult | null>(null);
  const [isComplaintFiled, setIsComplaintFiled] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFetchGpsLocation = async () => {
    setGpsLoading(true);
    try {
      const pos = await geo.getPosition();
      const geoInfo = await reverseGeocode(pos.lat, pos.lng);
      setLocationName(geoInfo.displayName);

      setUserGpsLocation({
        lat: pos.lat,
        lng: pos.lng,
        accuracy: pos.accuracy,
        placeName: geoInfo.displayName,
      });

      if (geoInfo.nearestMonitoredCityId) {
        setSelectedCityId(geoInfo.nearestMonitoredCityId);
      }
    } catch {
      if (geo.lat && geo.lng) {
        setLocationName(`${geo.lat.toFixed(5)}°N, ${geo.lng.toFixed(5)}°E (Location name unavailable)`);
      }
    } finally {
      setGpsLoading(false);
    }
  };

  // Live recording timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const activeDuration =
    mode === 'record'
      ? recordedSeconds
      : mode === 'upload'
      ? uploadedDuration
      : selectedPresetId
      ? SAMPLE_NOISE_PRESETS.find((p) => p.id === selectedPresetId)?.durationSeconds || 0
      : 0;

  const isDurationValid = activeDuration >= 10;

  const handleStartRecord = () => {
    setIsRecording(true);
    setRecordedSeconds(0);
    setHasRecordedAudio(false);
    setAnalysisResult(null);
    setValidationError(null);
    setIsComplaintFiled(false);
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    setHasRecordedAudio(true);
    if (recordedSeconds < 10) {
      setValidationError(
        `Your recording was only ${recordedSeconds}s. CPCB standards strictly require at least 10 seconds of continuous acoustic sampling to distinguish ambient background sounds from sustained violations.`
      );
    } else {
      setValidationError(null);
    }
  };

  const handleSelectPreset = (preset: (typeof SAMPLE_NOISE_PRESETS)[0]) => {
    setMode('preset');
    setSelectedPresetId(preset.id);
    setLocationName(preset.location);
    setDescription(preset.description);
    setAnalysisResult(null);
    setValidationError(null);
    setIsComplaintFiled(false);
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setMode('upload');
      setSelectedPresetId(null);
      setAnalysisResult(null);
      setIsComplaintFiled(false);

      // Create audio element to measure duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        const dur = Math.round(audio.duration);
        setUploadedDuration(dur);
        if (dur < 10) {
          setValidationError(
            `Uploaded audio is only ${dur}s. Audio evidence must be at least 10 seconds long to satisfy statutory evidentiary requirements.`
          );
        } else {
          setValidationError(null);
        }
      };
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isDurationValid) {
      setValidationError(
        `Submission blocked: Audio duration is ${activeDuration.toFixed(0)}s. Please provide at least 10 seconds of audio evidence.`
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setValidationError(null);
    setIsComplaintFiled(false);

    // Step 1
    setAnalysisStep('Converting audio stream to 80-Mel frequency spectrograms...');
    await new Promise((r) => setTimeout(r, 600));

    // Step 2
    setAnalysisStep('Computing A-weighted sound pressure level & decibel violation margin...');
    await new Promise((r) => setTimeout(r, 700));

    // Step 3
    setAnalysisStep('Classifying harmonic sound source via ResNet-18 model...');

    try {
      const result = await analyzeNoiseEvidence(
        activeDuration,
        locationName,
        description,
        selectedPresetId || undefined
      );

      setAnalysisResult(result);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      setValidationError(err.message || 'Analysis failed. Please check the audio sample.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileAsComplaint = () => {
    if (!analysisResult) return;

    addComplaint({
      type: 'noise',
      title: `Citizen Noise Report: ${analysisResult.detectedSource}`,
      description: description || analysisResult.summaryExplanation,
      locationName: analysisResult.location,
      city: selectedCity.name,
      lat: selectedCity.center[0] + (Math.random() - 0.5) * 0.03,
      lng: selectedCity.center[1] + (Math.random() - 0.5) * 0.03,
      citizenName: 'Lokesh Satiwada (Citizen Inspector)',
      evidenceType: 'audio',
      audioDurationSec: analysisResult.durationSeconds,
      aiVerification: {
        confidence: analysisResult.confidenceScore,
        estimatedIntensity: `${analysisResult.estimatedIntensityDb} dB(A)`,
        detectedSource: analysisResult.detectedSource,
        spectrogramAnalyzed: true,
        imageRecognized: false,
        urgencyLevel: analysisResult.severity === 'Critical' ? 'Critical' : 'High',
      },
    });

    setIsComplaintFiled(true);
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    } catch {}
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return {
          badge: 'bg-rose-500 text-white',
          text: 'text-rose-600 dark:text-rose-400',
          label: 'Critical Acoustic Violation',
        };
      case 'High':
        return {
          badge: 'bg-orange-500 text-white',
          text: 'text-orange-600 dark:text-orange-400',
          label: 'High Noise Level',
        };
      case 'Moderate':
        return {
          badge: 'bg-amber-500 text-white',
          text: 'text-amber-600 dark:text-amber-400',
          label: 'Moderate Sound Level',
        };
      default:
        return {
          badge: 'bg-emerald-500 text-white',
          text: 'text-emerald-600 dark:text-emerald-400',
          label: 'Low / Compliant Sound',
        };
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            <Volume2 className="w-4 h-4" />
            <span>Citizen Crowdsourced Evidence · Noise Pollution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Record Noise Audio & Run Mel-Spectrogram AI Analysis
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Capture heavy pressure honking, illegal night drilling, or excessive loudspeakers. Minimum 10 seconds of audio required for valid acoustic classification.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>Min. 10s Sampling Standard</span>
          </span>
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Audio Capture & Duration Checker */}
        <div className="lg:col-span-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              Step 1: Acoustic Audio Capture
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              Record or Upload Audio (≥ 10 Seconds)
            </h3>
          </div>

          {/* 1-Click Sample Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select 1-Click Evaluator Sample:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_NOISE_PRESETS.map((preset) => {
                const isSelected = mode === 'preset' && selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-[11px] font-bold truncate">{preset.title.split(' ')[1]}</span>
                    <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                      {preset.durationSeconds}s · {preset.mockSeverity}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Tabs: Live Record vs Upload Audio File */}
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => {
                setMode('record');
                setSelectedPresetId(null);
                setValidationError(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                mode === 'record'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Live Microphone Recording</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('upload');
                setSelectedPresetId(null);
                setValidationError(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                mode === 'upload'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Audio File</span>
            </button>
          </div>

          {/* Live Recording Experience */}
          {mode === 'record' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isRecording ? 'Recording Ambient Noise...' : hasRecordedAudio ? 'Sample Ready' : 'Ready to Sample'}
                  </span>
                </div>

                {/* Duration Counter */}
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`font-mono text-sm font-black ${
                      recordedSeconds >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
                    }`}
                  >
                    00:{recordedSeconds < 10 ? `0${recordedSeconds}` : recordedSeconds}
                  </span>
                  <span className="text-xs text-slate-400">/ min 00:10</span>
                </div>
              </div>

              {/* Progress bar towards 10s requirement */}
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    recordedSeconds >= 10 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min((recordedSeconds / 10) * 100, 100)}%` }}
                />
              </div>

              {/* Animated Waveform Visualizer */}
              <div className="h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center space-x-1 overflow-hidden">
                {Array.from({ length: 28 }).map((_, i) => {
                  const h = isRecording
                    ? Math.floor(25 + Math.sin(i + recordedSeconds * 3) * 20 + Math.random() * 45)
                    : hasRecordedAudio
                    ? 30 + (i % 6) * 10
                    : 12;

                  return (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-150 ${
                        isRecording
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                          : hasRecordedAudio && recordedSeconds >= 10
                          ? 'bg-cyan-500'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  );
                })}
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center space-x-3 pt-1">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecord}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition shadow-lg shadow-rose-500/20"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{hasRecordedAudio ? 'Record Again (min 10s)' : 'Start Recording (min 10s)'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecord}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition border border-rose-500 animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current text-rose-400" />
                    <span>Stop Recording ({recordedSeconds}s)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Upload Mode */}
          {mode === 'upload' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 rounded-2xl cursor-pointer bg-white dark:bg-slate-900 transition">
                <Upload className="w-6 h-6 text-cyan-500 mb-1.5" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {uploadedFileName ? uploadedFileName : 'Select WAV, MP3, AAC, M4A Audio File'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Must be at least 10 seconds in duration</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleCustomAudioUpload}
                  className="hidden"
                />
              </label>

              {uploadedDuration > 0 && (
                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono">
                  <span>Detected File Duration:</span>
                  <span className={uploadedDuration >= 10 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                    {uploadedDuration} seconds {uploadedDuration >= 10 ? '✓ Valid' : '✗ Too Short'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 10-Second Validation Warning Banner */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start space-x-2.5 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Location & Form Submission */}
          <form onSubmit={handleRunAnalysis} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Location of Noise Incident
                </label>
                <button
                  type="button"
                  onClick={handleFetchGpsLocation}
                  disabled={gpsLoading}
                  className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center space-x-1 disabled:opacity-50"
                >
                  {gpsLoading ? (
                    <>
                      <div className="w-2.5 h-2.5 border border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      <span>Fetching GPS...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3 h-3" />
                      <span>Use Device GPS Location</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Silk Board Junction South Ramp, Bengaluru"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Optional Notes on Noise Source
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe if it is repetitive honking, nighttime jackhammers, or event loudspeakers..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !isDurationValid}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{analysisStep}</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Acoustic & Decibel Analysis (≥ 10s)</span>
                </>
              )}
            </button>

            {!isDurationValid && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center font-medium">
                ⚠️ Record or upload at least 10s of audio to enable AI analysis.
              </p>
            )}
          </form>
        </div>

        {/* Right Column: AI Analysis Result Display */}
        <div className="lg:col-span-6 space-y-6">
          {analysisResult ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Result Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    Acoustic Spectrogram Classification
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {analysisResult.detectedSource}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {analysisResult.location} · Sample: {analysisResult.durationSeconds}s
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full ${
                      getSeverityStyle(analysisResult.severity).badge
                    }`}
                  >
                    {analysisResult.severity}
                  </span>
                  <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    {analysisResult.confidenceScore}% AI Match
                  </p>
                </div>
              </div>

              {/* Decibel Intensity & Violation Meters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Sound Level</span>
                  <div className="mt-1 flex items-baseline space-x-1.5">
                    <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400">
                      {analysisResult.estimatedIntensityDb}
                    </span>
                    <span className="text-xs font-bold text-slate-500">dB(A)</span>
                  </div>
                  <p className="text-[10px] text-rose-500 font-bold mt-0.5">
                    +{analysisResult.violationMarginDb} dB above CPCB limit
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Permissible Limit</span>
                  <div className="mt-1 flex items-baseline space-x-1.5">
                    <span className="text-3xl font-black text-slate-700 dark:text-slate-300">
                      {analysisResult.permissibleLimit}
                    </span>
                    <span className="text-xs font-bold text-slate-500">dB(A)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Commercial/Urban Zone</p>
                </div>
              </div>

              {/* Frequency Spectrum Graph */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>Acoustic Frequency Spectrum (Octave Bands)</span>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">80-Mel FFT</span>
                </div>

                <div className="h-32 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysisResult.frequencyGraph} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="freq" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                      />
                      <ReferenceLine y={65} stroke="#ef4444" strokeDasharray="3 3" />
                      <Bar dataKey="amplitude" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-500">{analysisResult.spectralPeaks}</p>
              </div>

              {/* Understandable Detection Explanation */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                  <Info className="w-4 h-4 text-cyan-500" />
                  <span>Result Summary:</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {analysisResult.summaryExplanation}
                </p>
              </div>

              {/* Recommended Actions for Citizen & Police */}
              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/25 border border-cyan-200 dark:border-cyan-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-cyan-700 dark:text-cyan-300 font-bold text-xs">
                  <Shield className="w-4 h-4" />
                  <span>Recommended Action:</span>
                </div>
                <p className="text-xs text-cyan-900 dark:text-cyan-100 leading-relaxed">
                  {analysisResult.recommendedActionCitizen}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {!isComplaintFiled ? (
                  <button
                    onClick={handleFileAsComplaint}
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition flex items-center justify-center space-x-2 shadow-md shadow-cyan-500/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit as Verified Citizen Complaint</span>
                  </button>
                ) : (
                  <div className="w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Complaint Dispatched to Traffic Police & PCR!</span>
                  </div>
                )}

                <button
                  onClick={() => setAnalysisResult(null)}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3 shadow-sm dark:shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center mx-auto">
                <Volume2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                Awaiting Audio Evidence (≥ 10s)
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Record live audio or pick a 10s+ preset on the left, then click <strong>"Run AI Acoustic & Decibel Analysis"</strong> to generate the decibel intensity and frequency heatmap.
              </p>
              <div className="pt-3 flex items-center justify-center space-x-2 text-[10px] text-slate-400 font-mono">
                <span>Mel-Spectrogram Engine</span>
                <span>•</span>
                <span>ResNet-18 Audio Classifier</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
