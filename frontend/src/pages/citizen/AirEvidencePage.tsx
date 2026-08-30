import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wind,
  Camera,
  Upload,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Send,
  RotateCcw,
  Shield,
  ArrowRight,
  Info,
  FileText,
} from 'lucide-react';
import { SAMPLE_AIR_PRESETS, analyzeAirEvidence } from '../../services/api/evidenceService';
import { AirAnalysisResult } from '../../types';
import { useGeolocation } from '../../hooks/useGeolocation';
import { reverseGeocode } from '../../services/api/geocodingService';
import confetti from 'canvas-confetti';

export const AirEvidencePage: React.FC = () => {
  const { selectedCity, setSelectedCityId, setUserGpsLocation, addComplaint } = useApp();
  const geo = useGeolocation(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>(
    `${selectedCity.pockets[0]?.name || selectedCity.name}, ${selectedCity.state}`
  );
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AirAnalysisResult | null>(null);
  const [isComplaintFiled, setIsComplaintFiled] = useState<boolean>(false);

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

  // Quick preset selector
  const handleSelectPreset = (preset: (typeof SAMPLE_AIR_PRESETS)[0]) => {
    setSelectedPresetId(preset.id);
    setSelectedImage(preset.imageUrl);
    setLocationName(preset.location);
    setDescription(preset.description);
    setAnalysisResult(null);
    setIsComplaintFiled(false);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setSelectedPresetId(null);
          setAnalysisResult(null);
          setIsComplaintFiled(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      alert('Please upload an image or choose one of the sample presets below.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setIsComplaintFiled(false);

    // Step 1
    setAnalysisStep('Scanning optical soot density & particulate opacity...');
    await new Promise((r) => setTimeout(r, 600));

    // Step 2
    setAnalysisStep('Cross-referencing with CPCB regional sensor dispersion grid...');
    await new Promise((r) => setTimeout(r, 650));

    // Step 3
    setAnalysisStep('Synthesizing health risk advisory & authority action...');

    try {
      const result = await analyzeAirEvidence(
        selectedImage,
        locationName,
        description,
        selectedPresetId || undefined
      );

      setAnalysisResult(result);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileAsComplaint = () => {
    if (!analysisResult) return;

    addComplaint({
      type: 'air',
      title: `Citizen Report: ${analysisResult.detectedSource}`,
      description: description || analysisResult.summaryExplanation,
      locationName: analysisResult.location,
      city: selectedCity.name,
      lat: selectedCity.center[0] + (Math.random() - 0.5) * 0.03,
      lng: selectedCity.center[1] + (Math.random() - 0.5) * 0.03,
      citizenName: 'Lokesh Satiwada (Citizen Inspector)',
      evidenceType: 'photo',
      imageUrl: analysisResult.imageUrl,
      aiVerification: {
        confidence: analysisResult.confidenceScore,
        estimatedIntensity: analysisResult.aqiImpact,
        detectedSource: analysisResult.detectedSource,
        spectrogramAnalyzed: false,
        imageRecognized: true,
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
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-500 text-white',
          label: 'Critical Pollution Warning',
        };
      case 'Unhealthy':
        return {
          bg: 'bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-400',
          badge: 'bg-orange-500 text-white',
          label: 'Unhealthy Pollution Level',
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-500 text-white',
          label: 'Moderate Environmental Strain',
        };
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-500 text-white',
          label: 'Normal / Acceptable',
        };
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            <Wind className="w-4 h-4" />
            <span>Citizen Crowdsourced Evidence · Air Quality</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Upload Air Pollution Photo & Run AI Diagnostics
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Capture visible smoke, dust plumes, industrial stack emissions, or open waste burning. Our AI interprets severity and health risks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>Computer Vision Ready</span>
          </span>
        </div>
      </div>

      {/* Main Evidence Form & Analysis Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Upload & Location */}
        <div className="lg:col-span-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Step 1: Evidence Capture
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              Select or Upload Photo Evidence
            </h3>
          </div>

          {/* Quick Presets for Demo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Choose Quick Sample Preset (1-Click):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_AIR_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-[11px] font-bold truncate">{preset.title.split(' ')[0]}</span>
                    <span className="text-[9px] opacity-75 truncate">{preset.mockSeverity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Or Upload Image File from Device:
            </label>
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-950/60 transition group">
              <Upload className="w-6 h-6 text-teal-500 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click to browse JPG, PNG, WEBP
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">Geotagged smartphone photos recommended</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Image Preview Box */}
          {selectedImage && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
              <img
                src={selectedImage}
                alt="Air Pollution Preview"
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono flex items-center space-x-1">
                <Camera className="w-3 h-3 text-teal-400" />
                <span>Evidence Image Loaded</span>
              </div>
            </div>
          )}

          {/* Location & Notes */}
          <form onSubmit={handleStartAnalysis} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Micro-Pocket Location
                </label>
                <button
                  type="button"
                  onClick={handleFetchGpsLocation}
                  disabled={gpsLoading}
                  className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1 disabled:opacity-50"
                >
                  {gpsLoading ? (
                    <>
                      <div className="w-2.5 h-2.5 border border-teal-500 border-t-transparent rounded-full animate-spin" />
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
                placeholder="e.g. Wazirpur Industrial Phase 2, North Delhi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Optional Incident Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe visible color, odor, proximity to residential blocks..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !selectedImage}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{analysisStep}</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Optical Pollution Analysis</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: AI Analysis Result Display */}
        <div className="lg:col-span-6 space-y-6">
          {analysisResult ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Result Header & Severity Badge */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    AI Visual Analysis Result
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {analysisResult.detectedSource}
                  </h3>
                  <p className="text-xs text-slate-500">{analysisResult.location}</p>
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

              {/* Key Environmental Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Local AQI</span>
                  <div className="mt-1 flex items-baseline space-x-1.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {analysisResult.estimatedAqi}
                    </span>
                    <span className="text-xs font-bold text-rose-500">AQI</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{analysisResult.aqiImpact}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Primary Pollutants</span>
                  <div className="mt-1 flex items-baseline space-x-1.5">
                    <span className="text-base font-black text-teal-600 dark:text-teal-300">
                      {analysisResult.primaryPollutant}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Micro-pocket dispersion risk</p>
                </div>
              </div>

              {/* Clear Explanation in Plain Language */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                  <Info className="w-4 h-4 text-teal-500" />
                  <span>AI Detection Summary:</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {analysisResult.summaryExplanation}
                </p>
              </div>

              {/* Health Impact & Asthma Advisory */}
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  <HeartPulse className="w-4 h-4" />
                  <span>Health Risk Information:</span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                  {analysisResult.healthImpact}
                </p>
              </div>

              {/* Recommended Action */}
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/25 border border-teal-200 dark:border-teal-500/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-300 font-bold text-xs">
                  <Shield className="w-4 h-4" />
                  <span>Recommended Citizen Action:</span>
                </div>
                <p className="text-xs text-teal-900 dark:text-teal-100 leading-relaxed">
                  {analysisResult.recommendedActionCitizen}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {!isComplaintFiled ? (
                  <button
                    onClick={handleFileAsComplaint}
                    className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition flex items-center justify-center space-x-2 shadow-md shadow-teal-500/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit as Verified Citizen Complaint</span>
                  </button>
                ) : (
                  <div className="w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Complaint Dispatched to Municipal Enforcement!</span>
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
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center mx-auto">
                <Wind className="w-7 h-7" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                Awaiting Photo Evidence
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Upload an image or pick a sample preset on the left, then click <strong>"Run AI Optical Pollution Analysis"</strong> to generate a severity rating and health impact breakdown.
              </p>
              <div className="pt-3 flex items-center justify-center space-x-2 text-[10px] text-slate-400 font-mono">
                <span>ResNet-50 Vision Engine</span>
                <span>•</span>
                <span>Spatial Kriging Model</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
