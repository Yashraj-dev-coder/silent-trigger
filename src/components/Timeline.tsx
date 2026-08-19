import { type LucideIcon, Siren, MapPin, Mic, Video, AlertTriangle, CheckCircle2, Radio, Activity } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import type { ActivityLog } from '@/lib/types';

function getIcon(event: string): LucideIcon {
  if (event.includes('Activated') && event.includes('Trigger')) return Siren;
  if (event.includes('Received')) return Radio;
  if (event.includes('Location')) return MapPin;
  if (event.includes('Audio')) return Mic;
  if (event.includes('Video')) return Video;
  if (event.includes('Alert')) return AlertTriangle;
  if (event.includes('Acknowledged')) return CheckCircle2;
  if (event.includes('Responding') || event.includes('En Route')) return Activity;
  if (event.includes('Resolved')) return CheckCircle2;
  return Activity;
}

export function Timeline({ logs }: { logs: ActivityLog[] }) {
  const sorted = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-200 mb-4">Incident Timeline</h3>
      <div className="relative">
        {sorted.length === 0 && (
          <p className="text-sm text-navy-400 py-4">No timeline events yet.</p>
        )}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-navy-700" />
        {sorted.map((log, idx) => {
          const Icon = getIcon(log.event);
          const isLatest = idx === sorted.length - 1;
          return (
            <div key={log.id} className="relative flex gap-4 pb-5 last:pb-0 animate-fade-in">
              <div
                className={cn(
                  'z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2',
                  isLatest
                    ? 'border-emergency-500 bg-emergency-500/20 text-emergency-400'
                    : 'border-navy-600 bg-navy-800 text-navy-300'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-navy-400">{formatTime(log.timestamp)}</span>
                  {isLatest && (
                    <span className="text-[10px] font-bold uppercase text-emergency-400 animate-pulse">Latest</span>
                  )}
                </div>
                <p className="text-sm font-semibold text-navy-100 mt-0.5">{log.event}</p>
                {log.description && (
                  <p className="text-xs text-navy-400 mt-0.5">{log.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
