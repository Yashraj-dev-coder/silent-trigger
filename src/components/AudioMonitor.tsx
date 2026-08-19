import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Mic, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function AudioMonitor() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const barCount = 40;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-info-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-200">Audio Monitor</h3>
        </div>
        <div className="flex items-center gap-2">
          {isPlaying && (
            <Badge color="bg-emergency-500/20 text-emergency-400 border-emergency-500/40" pulse>
              <span className="h-1.5 w-1.5 rounded-full bg-emergency-400" /> RECORDING
            </Badge>
          )}
          <Badge color="bg-navy-700/40 text-navy-300 border-navy-600/40">
            <Radio className="h-3 w-3" /> SIMULATED
          </Badge>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-mono font-bold text-white tracking-wider">{formatElapsed(elapsed)}</p>
      </div>

      <div className="flex items-center justify-center gap-1 h-20 mb-4 bg-navy-900/50 rounded-lg overflow-hidden px-3">
        {Array.from({ length: barCount }).map((_, i) => (
          <div
            key={i}
            className="waveform-bar w-1 rounded-full bg-gradient-to-t from-info-600 to-info-400"
            style={{
              height: `${isPlaying ? 20 + Math.sin(i * 0.5 + elapsed * 0.3) * 30 + Math.random() * 20 : 5}%`,
              animationDelay: `${i * 0.05}s`,
              animationPlayState: isPlaying ? 'running' : 'paused',
              opacity: isPlaying ? 0.8 : 0.3,
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPlaying(true)}
          disabled={isPlaying}
          className="flex items-center gap-2 rounded-lg border border-navy-700 px-3 py-2 text-sm font-semibold text-navy-200 hover:bg-navy-800 transition-colors disabled:opacity-50"
        >
          <Play className="h-4 w-4" /> Play Demo
        </button>
        <button
          onClick={() => setIsPlaying(false)}
          className="flex items-center gap-2 rounded-lg border border-navy-700 px-3 py-2 text-sm font-semibold text-navy-200 hover:bg-navy-800 transition-colors"
        >
          <Pause className="h-4 w-4" /> Pause
        </button>
        <button
          onClick={() => { setIsPlaying(false); setElapsed(0); }}
          className="flex items-center gap-2 rounded-lg border border-navy-700 px-3 py-2 text-sm font-semibold text-navy-200 hover:bg-navy-800 transition-colors"
        >
          <Square className="h-4 w-4" /> Stop
        </button>
      </div>

      <p className="mt-3 text-xs text-navy-400 italic">SIMULATED AUDIO STREAM — No microphone access required</p>
    </div>
  );
}
