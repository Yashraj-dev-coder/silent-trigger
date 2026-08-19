import { useState, useEffect } from 'react';
import { Video, Radio, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatTime } from '@/lib/utils';

interface VideoMonitorProps {
  deviceId?: string;
}

export function VideoMonitor({ deviceId = 'ST-001' }: VideoMonitorProps) {
  const [time, setTime] = useState(new Date());
  const [scanPos, setScanPos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      setScanPos((p) => (p + 1) % 100);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-info-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-200">Video Monitor</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge color="bg-emergency-500/20 text-emergency-400 border-emergency-500/40" pulse>
            <span className="h-1.5 w-1.5 rounded-full bg-emergency-400" /> LIVE
          </Badge>
          <Badge color="bg-navy-700/40 text-navy-300 border-navy-600/40">
            <Radio className="h-3 w-3" /> SIMULATED
          </Badge>
        </div>
      </div>

      <div className="relative aspect-video bg-navy-950 rounded-lg overflow-hidden border border-navy-700">
        {/* Simulated camera feed background */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Center crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -left-6 top-1/2 h-px w-12 -translate-y-1/2 bg-info-500/40" />
            <div className="absolute -right-6 top-1/2 h-px w-12 -translate-y-1/2 bg-info-500/40" />
            <div className="absolute left-1/2 -top-6 h-12 w-px -translate-x-1/2 bg-info-500/40" />
            <div className="absolute left-1/2 -bottom-6 h-12 w-px -translate-x-1/2 bg-info-500/40" />
            <div className="h-8 w-8 border-2 border-info-500/50 rounded-full" />
          </div>
        </div>

        {/* Scanning line */}
        <div
          className="absolute left-0 right-0 h-px bg-info-400/60 transition-all duration-1000 ease-linear"
          style={{ top: `${scanPos}%` }}
        />

        {/* Corner indicators */}
        <div className="absolute top-2 left-2 h-4 w-4 border-l-2 border-t-2 border-info-500/50" />
        <div className="absolute top-2 right-2 h-4 w-4 border-r-2 border-t-2 border-info-500/50" />
        <div className="absolute bottom-2 left-2 h-4 w-4 border-l-2 border-b-2 border-info-500/50" />
        <div className="absolute bottom-2 right-2 h-4 w-4 border-r-2 border-b-2 border-info-500/50" />

        {/* HUD overlay */}
        <div className="absolute top-3 left-3 space-y-1">
          <p className="font-mono text-xs text-info-300">DEVICE: {deviceId}</p>
          <p className="font-mono text-xs text-info-300">TIME: {formatTime(time)}</p>
          <p className="font-mono text-xs text-info-300">SOURCE: SIMULATED FEED</p>
        </div>

        <div className="absolute bottom-3 right-3">
          <button className="text-navy-400 hover:text-white transition-colors" aria-label="Fullscreen (simulated)">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Subtle noise effect */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-navy-400 italic">SIMULATED VIDEO FEED — No camera access required</p>
    </div>
  );
}
