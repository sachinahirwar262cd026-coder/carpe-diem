import React, { useState, useRef } from 'react';
import {
  Wind,
  Volume2,
  MapPin,
  Camera,
  Mic,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AudioRecorderSim } from './AudioRecorderSim';
import { CitizenComplaint } from '../../types';
import confetti from 'canvas-confetti';
import { useGeolocation } from '../../hooks/useGeolocation';
import { reverseGeocode } from '../../services/api/geocodingService';

interface ComplaintFormProps {
  onSuccess: (complaint: CitizenComplaint) => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccess }) => {
  const { selectedCity, setSelectedCityId, setUserGpsLocation, addComplaint } = useApp();
  const geo = useGeolocation(false);

  const [type, setType] = useState<'air' | 'noise' | 'both'>('air');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [evidenceMode, setEvidenceMode] = useState<'photo' | 'audio' | 'both'>('photo');

  // Real Image Capture State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Real Audio Capture State
  const [audioRecordedUrl, setAudioRecordedUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [detectedIntensity, setDetectedIntensity] = useState<string>('');
  const [aiConfidence, setAiConfidence] = useState<number>(96.8);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Real GPS & Reverse Geocoding
  const handleUseCurrentLocation = async () => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const pos = await geo.getPosition();
      setGpsCoords({ lat: pos.lat, lng: pos.lng });

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
    } catch (err: any) {
      setGpsError(err.message || 'Could not fetch device GPS.');
    } finally {
      setGpsLoading(false);
    }
  };

  // Real Image Picker / Drag & Drop
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Real Audio Callback
  const handleAudioRecorded = (duration: number, intensity: string, confidence: number, url?: string) => {
    setAudioDuration(duration);
    setDetectedIntensity(intensity);
    setAiConfidence(confidence);
    if (url) setAudioRecordedUrl(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim()) {
      alert('Please provide title, description, and location for the grievance.');
      return;
    }

    setIsSubmitting(true);

    const finalLat = gpsCoords ? gpsCoords.lat : selectedCity.center[0] + (Math.random() - 0.5) * 0.04;
    const finalLng = gpsCoords ? gpsCoords.lng : selectedCity.center[1] + (Math.random() - 0.5) * 0.04;

    setTimeout(() => {
      const newCmp = addComplaint({
        type,
        title,
        description,
        locationName,
        city: selectedCity.name,
        lat: finalLat,
        lng: finalLng,
        citizenName: 'Lokesh Satiwada (Verified Citizen)',
        evidenceType: evidenceMode,
        audioDurationSec: audioDuration || undefined,
        imageUrl: imagePreviewUrl || undefined,
        aiVerification: {
          confidence: aiConfidence,
          estimatedIntensity: detectedIntensity || (type === 'air' ? 'PM2.5 Elevated Spike' : '82.4 dB(A) Acoustic Exceedance'),
          detectedSource: type === 'air' ? 'Combustion / Dust Resuspension' : 'Commercial Traffic & Pressure Horns',
          spectrogramAnalyzed: !!audioRecordedUrl,
          imageRecognized: !!imagePreviewUrl,
          urgencyLevel: 'High',
        },
      });

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      setIsSubmitting(false);
      onSuccess(newCmp);
    }, 900);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Complaint Type Switcher */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          Select Pollution Category
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setType('air')}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
              type === 'air'
                ? 'bg-emerald-50 dark:bg-teal-500/20 text-emerald-900 dark:text-teal-300 border-emerald-500/50 dark:border-teal-500/50 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-emerald-600 dark:text-teal-400" />
              <span className="font-bold text-sm">Air Pollution</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Smoke, Dust, Odor, Industrial</span>
          </button>

          <button
            type="button"
            onClick={() => setType('noise')}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
              type === 'noise'
                ? 'bg-blue-50 dark:bg-cyan-500/20 text-blue-900 dark:text-cyan-300 border-blue-500/50 dark:border-cyan-500/50 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span className="font-bold text-sm">Noise Pollution</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Horns, Drilling, Loudspeakers</span>
          </button>

          <button
            type="button"
            onClick={() => setType('both')}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
              type === 'both'
                ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 border-purple-500/50 dark:border-purple-500/50 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-bold text-sm">Combined Both</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Generators, Heavy Construction</span>
          </button>
        </div>
      </div>

      {/* 2. Location Field with GPS button */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Incident Location
          </label>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={gpsLoading}
            className="text-[11px] text-emerald-600 dark:text-teal-400 hover:underline font-semibold flex items-center space-x-1 transition disabled:opacity-50"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{gpsLoading ? 'Acquiring Device GPS...' : 'Use Device GPS'}</span>
          </button>
        </div>
        <input
          type="text"
          required
          placeholder="e.g. Anand Vihar ISBT Terminal Corridor, Delhi"
          value={locationName}
          onChange={(e) => {
            setLocationName(e.target.value);
            setGpsCoords(null);
          }}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-teal-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm font-medium transition"
        />
        {gpsError && (
          <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{gpsError}</span>
          </p>
        )}
      </div>

      {/* 3. Title & Description */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Grievance Headline
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Uncovered building material dust resuspension and unshielded diesel generator"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-teal-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm font-medium transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Incident Description &amp; Source Details
          </label>
          <textarea
            required
            rows={3}
            placeholder="Describe the observed pollution source, duration, smoke color/density, or acoustic disturbance..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-teal-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm font-medium transition"
          />
        </div>
      </div>

      {/* 4. Evidence Mode & Real Upload / Audio Capture */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          Evidence Capture (Real Photo &amp; Microphone Audio)
        </label>

        <div className="flex items-center space-x-2 mb-3">
          <button
            type="button"
            onClick={() => setEvidenceMode('photo')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              evidenceMode === 'photo'
                ? 'bg-emerald-100 dark:bg-teal-500/20 text-emerald-800 dark:text-teal-300 border border-emerald-300 dark:border-teal-500/40'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photo Evidence</span>
          </button>
          <button
            type="button"
            onClick={() => setEvidenceMode('audio')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              evidenceMode === 'audio'
                ? 'bg-blue-100 dark:bg-cyan-500/20 text-blue-800 dark:text-cyan-300 border border-blue-300 dark:border-cyan-500/40'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Audio Recording</span>
          </button>
          <button
            type="button"
            onClick={() => setEvidenceMode('both')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              evidenceMode === 'both'
                ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Both Modes</span>
          </button>
        </div>

        {/* Real Audio Recorder Component */}
        {(evidenceMode === 'audio' || evidenceMode === 'both') && (
          <div className="mb-4">
            <AudioRecorderSim onAudioRecorded={handleAudioRecorded} />
          </div>
        )}

        {/* Real Photo File Upload & Camera Capture */}
        {(evidenceMode === 'photo' || evidenceMode === 'both') && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
              id="complaint-photo-upload"
            />

            {!imagePreviewUrl ? (
              <label
                htmlFor="complaint-photo-upload"
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-teal-500 rounded-xl p-6 text-center cursor-pointer transition block"
              >
                <Camera className="w-8 h-8 text-emerald-600 dark:text-teal-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Upload Photo Evidence / Capture Camera
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Supports JPG, PNG, WEBP from your phone or laptop
                </p>
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={imagePreviewUrl}
                    alt="Evidence Preview"
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {imageFile ? imageFile.name : 'captured_evidence.jpg'}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Real Image Evidence Attached
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0 ml-2"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Citizen Credibility Trust Bar */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Citizen Credibility Tier</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                Verified Citizen
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Score: 94/100 · Dispatched with high authority priority</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm transition shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {isSubmitting ? (
          <span>Dispatching Grievance to Municipal Pipeline...</span>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Submit Grievance to Enforcement Queue</span>
          </>
        )}
      </button>
    </form>
  );
};
