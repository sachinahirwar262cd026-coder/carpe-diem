import React, { useState } from 'react';
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
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AudioRecorderSim } from './AudioRecorderSim';
import { CitizenComplaint } from '../../types';
import confetti from 'canvas-confetti';

interface ComplaintFormProps {
  onSuccess: (complaint: CitizenComplaint) => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccess }) => {
  const { selectedCity, addComplaint } = useApp();

  const [type, setType] = useState<'air' | 'noise' | 'both'>('air');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [evidenceMode, setEvidenceMode] = useState<'photo' | 'audio' | 'both'>('photo');
  const [photoSelected, setPhotoSelected] = useState<boolean>(false);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [detectedIntensity, setDetectedIntensity] = useState<string>('');
  const [aiConfidence, setAiConfidence] = useState<number>(95.4);

  // Pre-fill location based on active city
  const handleUseCurrentLocation = () => {
    setLocationName(`${selectedCity.pockets[0]?.name || selectedCity.name}, ${selectedCity.state}`);
  };

  const handleSimulatePhotoUpload = () => {
    setPhotoSelected(true);
    if (type === 'air') {
      setDetectedIntensity('PM2.5 Spike ~ 240 µg/m³ (Heavy Smoke Plume)');
      setAiConfidence(97.8);
    } else {
      setDetectedIntensity('84.2 dB(A) - Heavy Machinery Vibration');
      setAiConfidence(96.2);
    }
  };

  const handleAudioRecorded = (duration: number, intensity: string, confidence: number) => {
    setAudioDuration(duration);
    setDetectedIntensity(intensity);
    setAiConfidence(confidence);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim()) {
      alert('Please provide title, description, and location for the complaint.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newCmp = addComplaint({
        type,
        title,
        description,
        locationName,
        city: selectedCity.name,
        lat: selectedCity.center[0] + (Math.random() - 0.5) * 0.04,
        lng: selectedCity.center[1] + (Math.random() - 0.5) * 0.04,
        citizenName: 'Lokesh Satiwada (Verified Citizen)',
        evidenceType: evidenceMode,
        audioDurationSec: audioDuration || undefined,
        imageUrl: photoSelected
          ? 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=600&q=80'
          : undefined,
        aiVerification: {
          confidence: aiConfidence,
          estimatedIntensity: detectedIntensity || (type === 'air' ? 'PM2.5 Elevated' : '82 dB(A) Exceeded'),
          detectedSource: type === 'air' ? 'Dense Combustion Plume' : 'High Decibel Construction / Traffic',
          spectrogramAnalyzed: evidenceMode === 'audio' || evidenceMode === 'both',
          imageRecognized: photoSelected,
          urgencyLevel: 'High',
        },
      });

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Confetti fallback
      }

      setIsSubmitting(false);
      onSuccess(newCmp);
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Complaint Type Switcher */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Select Complaint Domain
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setType('air')}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
              type === 'air'
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-md shadow-teal-500/10'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4" />
              <span className="font-bold text-sm">Air Pollution</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">Smoke, Dust, Odor, Industrial</span>
          </button>

          <button
            type="button"
            onClick={() => setType('noise')}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
              type === 'noise'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <span className="font-bold text-sm">Noise Pollution</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">Horns, Drilling, Loudspeakers</span>
          </button>

          <button
            type="button"
            onClick={() => setType('both')}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
              type === 'both'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md shadow-purple-500/10'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold text-sm">Combined / Both</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">Generator sets, Construction</span>
          </button>
        </div>
      </div>

      {/* 2. Location Field with GPS button */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Micro-Pocket Location
          </label>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1"
          >
            <MapPin className="w-3 h-3" />
            <span>Use GPS Location ({selectedCity.name})</span>
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            required
            placeholder="e.g. Anand Vihar ISBT Flyover near Bus Depot, Delhi"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-teal-500 focus:outline-none text-slate-100 placeholder-slate-500 text-sm font-medium transition"
          />
        </div>
      </div>

      {/* 3. Title & Description */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Complaint Summary Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Night Construction Jackhammer noise exceeding 85dB"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-teal-500 focus:outline-none text-slate-100 placeholder-slate-500 text-sm font-medium transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Detailed Incident Description
          </label>
          <textarea
            required
            rows={3}
            placeholder="Describe the source, duration, frequency, and immediate environmental impact..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-teal-500 focus:outline-none text-slate-100 placeholder-slate-500 text-sm font-medium transition"
          />
        </div>
      </div>

      {/* 4. Evidence Mode & Upload / Audio Simulation */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Evidence Attachment (AI Verified)
        </label>

        <div className="flex items-center space-x-2 mb-3">
          <button
            type="button"
            onClick={() => setEvidenceMode('photo')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              evidenceMode === 'photo'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
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
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
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
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Both Modes</span>
          </button>
        </div>

        {/* Audio Recorder Component */}
        {(evidenceMode === 'audio' || evidenceMode === 'both') && (
          <div className="mb-4">
            <AudioRecorderSim onAudioRecorded={handleAudioRecorded} />
          </div>
        )}

        {/* Photo Upload Simulator */}
        {(evidenceMode === 'photo' || evidenceMode === 'both') && (
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            {!photoSelected ? (
              <div
                onClick={handleSimulatePhotoUpload}
                className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-xl p-6 text-center cursor-pointer transition"
              >
                <Camera className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-200">Click to Attach Evidence Image</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  AI will analyze smoke plumes, generator exhausts, or construction equipment
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-xs">
                    IMG_RAW
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">evidence_sample_geotagged.jpg</p>
                    <p className="text-[10px] text-emerald-400 font-medium">AI Computer Vision Confirmed (98.4%)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPhotoSelected(false)}
                  className="text-xs text-rose-400 hover:underline px-2 py-1"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Citizen Credibility Trust Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white">Citizen Credibility Rating</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified Reporter
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Score: 94/100 · Based on previous verified complaint accuracy</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-sm transition-all duration-200 shadow-xl shadow-teal-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {isSubmitting ? (
          <span>Dispatching Evidence to Municipal AI Pipeline...</span>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Submit Citizen Complaint to Authority Queue</span>
          </>
        )}
      </button>
    </form>
  );
};
