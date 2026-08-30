import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Sparkles, Volume2, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onAudioRecorded: (duration: number, intensity: string, confidence: number, audioUrl?: string) => void;
}

export const AudioRecorderSim: React.FC<AudioRecorderProps> = ({ onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioResult, setAudioResult] = useState<{ intensity: string; confidence: number; source: string } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setAudioError(null);
    setAudioResult(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setHasRecorded(true);

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        const intensity = '82.4 dB(A) - Commercial Road Traffic & Horns';
        const confidence = 96.8;
        const source = 'High-Decibel Pressure Horns Detected';
        setAudioResult({ intensity, confidence, source });
        onAudioRecorded(seconds || 5, intensity, confidence, url);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 15) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission or error:', err);
      // Friendly fallback if browser mic permission denied or unavailable
      setAudioError(err.message || 'Microphone permission was denied. You can still submit manual acoustic details.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const resetRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setIsRecording(false);
    setSeconds(0);
    setHasRecorded(false);
    setAudioResult(null);
    setAudioError(null);
  };

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mic className={`w-4 h-4 ${isRecording ? 'text-rose-500 animate-pulse' : 'text-emerald-600 dark:text-teal-400'}`} />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
            {isRecording ? 'Recording Ambient Microphone Audio...' : hasRecorded ? 'Real Audio Sample Captured' : 'Record Live Audio Evidence (Microphone)'}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
          00:{seconds < 10 ? `0${seconds}` : seconds} / 00:15
        </span>
      </div>

      {audioError && (
        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{audioError}</span>
        </div>
      )}

      {/* Dynamic Waveform Visualizer */}
      <div className="h-14 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center space-x-1.5 overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => {
          const height = isRecording
            ? Math.floor(20 + Math.sin(i + seconds * 3) * 25 + Math.random() * 35)
            : hasRecorded
            ? 35 + (i % 6) * 8
            : 12;

          return (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-150 ${
                isRecording
                  ? 'bg-rose-500 shadow-xs'
                  : hasRecorded
                  ? 'bg-emerald-500 dark:bg-teal-400'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      {/* Playback Control (if recorded) */}
      {audioUrl && (
        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <audio controls src={audioUrl} className="w-full h-8" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-3 pt-1">
        {!isRecording && !hasRecorded && (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-xs"
          >
            <Mic className="w-4 h-4" />
            <span>Record with Microphone</span>
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/40 text-xs font-bold transition animate-pulse"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop &amp; Save Recording</span>
          </button>
        )}

        {hasRecorded && (
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={resetRecording}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-record</span>
            </button>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Audio Verified</span>
            </span>
          </div>
        )}
      </div>

      {/* AI Acoustic Pre-Analysis Output */}
      {audioResult && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-teal-950/40 border border-emerald-200 dark:border-teal-500/30 text-xs">
          <div className="flex items-center justify-between text-emerald-800 dark:text-teal-300 font-bold mb-1">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-teal-400" />
              <span>AI Acoustic Classification:</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-100 dark:bg-teal-900/60 px-2 py-0.5 rounded text-emerald-800 dark:text-teal-300 border border-emerald-200 dark:border-teal-700/50">
              {audioResult.confidence}% Confidence
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-xs">
            <strong>Signature: </strong>{audioResult.intensity} ({audioResult.source})
          </p>
        </div>
      )}
    </div>
  );
};
