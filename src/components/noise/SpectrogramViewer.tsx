import React, { useState } from 'react';
import { Radio, Sparkles, Volume2, Play, Square, Cpu, CheckCircle } from 'lucide-react';

interface AudioSample {
  id: string;
  name: string;
  category: string;
  intensity: string;
  confidence: number;
  frequencies: number[][]; // Mock 2D spectrogram matrix
}

const SAMPLE_AUDIO_EVIDENCE: AudioSample[] = [
  {
    id: 'sample-horns',
    name: 'Anand Vihar Pressure Horns & Traffic Gridlock',
    category: 'Vehicular Multi-Tone Pressure Horns',
    intensity: '88.2 dB(A)',
    confidence: 97.4,
    frequencies: [
      [20, 35, 80, 90, 85, 40, 25, 20],
      [30, 60, 95, 100, 90, 50, 30, 20],
      [40, 75, 100, 100, 95, 70, 45, 30],
      [25, 50, 90, 95, 80, 40, 30, 20],
      [15, 30, 70, 85, 75, 35, 20, 15],
    ],
  },
  {
    id: 'sample-jackhammer',
    name: 'BKC Metro Night Hydraulic Jackhammer',
    category: 'Hydraulic Impact & Concrete Chipping',
    intensity: '92.6 dB(A)',
    confidence: 96.2,
    frequencies: [
      [80, 85, 75, 40, 20, 15, 10, 10],
      [95, 100, 90, 50, 25, 20, 15, 10],
      [90, 95, 85, 45, 30, 20, 15, 10],
      [100, 100, 90, 55, 30, 25, 20, 15],
      [85, 90, 80, 40, 20, 15, 10, 10],
    ],
  },
  {
    id: 'sample-loudspeaker',
    name: 'Indiranagar Commercial Event Loudspeakers',
    category: 'Public Address & Amplified Music',
    intensity: '79.4 dB(A)',
    confidence: 95.8,
    frequencies: [
      [30, 50, 70, 85, 90, 80, 60, 40],
      [40, 60, 80, 95, 95, 85, 70, 50],
      [50, 70, 90, 100, 100, 90, 80, 60],
      [40, 65, 85, 95, 95, 85, 70, 50],
      [25, 45, 65, 80, 85, 75, 55, 35],
    ],
  }
];

export const SpectrogramViewer: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<AudioSample>(SAMPLE_AUDIO_EVIDENCE[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const getHeatmapColor = (val: number) => {
    if (val >= 90) return 'bg-rose-500 text-white';
    if (val >= 75) return 'bg-orange-500 text-white';
    if (val >= 50) return 'bg-amber-400 text-slate-950';
    if (val >= 30) return 'bg-teal-500 text-slate-950';
    return 'bg-slate-800 text-slate-400';
  };

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Audio AI Evidence Classifier
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white mt-0.5">
            Mel-Spectrogram & CNN Acoustic Analysis
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-teal-300 font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>ResNet-18 Audio Backbone</span>
        </div>
      </div>

      {/* Sample Selector Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        {SAMPLE_AUDIO_EVIDENCE.map((sample) => (
          <button
            key={sample.id}
            onClick={() => {
              setSelectedSample(sample);
              setIsPlaying(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              selectedSample.id === sample.id
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/40'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{sample.name.split(' ')[0]} {sample.name.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* Visual Spectrogram Grid */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: 2D Mel-Spectrogram Heatmap */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b border-slate-800/80">
            <span className="font-bold text-slate-300">Mel Frequency Spectrogram (80 Mels)</span>
            <button
              onClick={togglePlay}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                isPlaying ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-teal-500 text-slate-950'
              }`}
            >
              {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPlaying ? 'Pause Sample' : 'Simulate Audio'}</span>
            </button>
          </div>

          {/* Grid representation of Mel frequencies */}
          <div className="space-y-1.5">
            {selectedSample.frequencies.map((row, rIdx) => (
              <div key={rIdx} className="flex items-center space-x-1.5">
                <span className="w-12 text-[10px] font-mono text-slate-500 text-right">
                  {8000 / (rIdx + 1)}Hz
                </span>
                <div className="flex-1 grid grid-cols-8 gap-1.5">
                  {row.map((val, cIdx) => (
                    <div
                      key={cIdx}
                      className={`h-7 rounded-md flex items-center justify-center text-[9px] font-mono font-bold transition-all duration-300 ${getHeatmapColor(
                        isPlaying ? Math.min(100, val + (Math.sin(cIdx + Date.now()) * 15)) : val
                      )}`}
                    >
                      {val}%
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.0s (Time Start)</span>
            <span>2.5s</span>
            <span>5.0s (Sample End)</span>
          </div>
        </div>

        {/* Right: AI CNN Classification Results */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
              CNN Model Output
            </span>
            <h4 className="text-base font-extrabold text-white mt-1">
              {selectedSample.category}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">{selectedSample.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-medium">Estimated Intensity</span>
              <p className="text-xl font-black text-cyan-400 mt-1">{selectedSample.intensity}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-medium">AI Confidence</span>
              <p className="text-xl font-black text-emerald-400 mt-1">{selectedSample.confidence}%</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/20 text-xs text-slate-300">
            <div className="flex items-center space-x-1.5 text-teal-300 font-bold mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
              <span>Automatic Evidentiary Validation</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Mel spectral peaks match the acoustic signature of high-pressure multi-tone horns. Automatically classified as non-compliant under Central Motor Vehicle Rules (Rule 119).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
