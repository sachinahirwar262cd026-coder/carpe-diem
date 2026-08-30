import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, Sparkles, Volume2, CheckCircle2, RotateCcw } from 'lucide-react';

interface AudioRecorderSimProps {
  onAudioRecorded: (duration: number, intensity: string, confidence: number) => void;
}

export const AudioRecorderSim: React.FC<AudioRecorderSimProps> = ({ onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);
  const [audioResult, setAudioResult] = useState<{ intensity: string; confidence: number; source: string } | null>(null);

  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 10) {
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setSeconds(0);
    setHasRecorded(false);
    setAudioResult(null);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);

    // Mock AI acoustic inference results
    const intensity = '86.4 dB(A) - Heavy Commercial Traffic & Horns';
    const confidence = 96.8;
    const source = 'High-Decibel Pressure Horns Detected';

    setAudioResult({ intensity, confidence, source });
    onAudioRecorded(seconds || 5, intensity, confidence);
  };

  const resetRecording = () => {
    setIsRecording(false);
    setSeconds(0);
    setHasRecorded(false);
    setAudioResult(null);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mic className={`w-4 h-4 ${isRecording ? 'text-rose-500 animate-pulse' : 'text-teal-400'}`} />
          <span className="text-xs font-bold text-slate-200">
            {isRecording ? 'Capturing Ambient Audio Evidence...' : hasRecorded ? 'Audio Sample Captured' : 'Record Audio Evidence'}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400">
          00:{seconds < 10 ? `0${seconds}` : seconds} / 00:10
        </span>
      </div>

      {/* Dynamic Waveform Visualizer */}
      <div className="h-16 rounded-xl bg-slate-900 border border-slate-800/80 p-2 flex items-center justify-center space-x-1.5 overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => {
          const height = isRecording
            ? Math.floor(20 + Math.sin(i + seconds * 2) * 20 + Math.random() * 40)
            : hasRecorded
            ? 35 + (i % 6) * 8
            : 10;

          return (
            <div
              key={i}
              className={`w-2 rounded-full transition-all duration-150 ${
                isRecording
                  ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                  : hasRecorded
                  ? 'bg-teal-400'
                  : 'bg-slate-700'
              }`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-3">
        {!isRecording && !hasRecorded && (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition shadow-lg shadow-rose-500/20"
          >
            <Mic className="w-4 h-4" />
            <span>Tap to Record Live Audio (5-10s)</span>
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/40 text-xs font-bold transition animate-pulse"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop & Run AI Analysis</span>
          </button>
        )}

        {hasRecorded && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={resetRecording}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-record</span>
            </button>
            <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Audio Verified</span>
            </span>
          </div>
        )}
      </div>

      {/* AI Acoustic Pre-Analysis Output */}
      {audioResult && (
        <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/30 text-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between text-teal-300 font-bold mb-1.5">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>AI Mel-Spectrogram Classification:</span>
            </div>
            <span className="text-[10px] font-mono bg-teal-900/60 px-2 py-0.5 rounded text-teal-300 border border-teal-700/50">
              {audioResult.confidence}% Confidence
            </span>
          </div>
          <div className="space-y-1 text-slate-300">
            <p>
              <strong>Detected Noise: </strong>
              <span className="text-cyan-300">{audioResult.intensity}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Source signature: {audioResult.source}. Ready for authority dispatch queue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
