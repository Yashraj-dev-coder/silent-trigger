import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Siren, MapPin, Cpu, Battery, Wifi, Satellite, Camera, Mic, AlertTriangle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { UserSidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StatusDot } from '@/components/ui/Badge';
import { MapView } from '@/components/MapView';
import { AudioMonitor } from '@/components/AudioMonitor';
import { VideoMonitor } from '@/components/VideoMonitor';
import { Timeline } from '@/components/Timeline';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS } from '@/lib/constants';
import { formatDateTime, duration, cn } from '@/lib/utils';
import type { EmergencyIncident, Device, IncidentLocation, IncidentMedia, ActivityLog, Profile } from '@/lib/types';

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const isResponder = profile?.role === 'RESPONDER' || profile?.role === 'ADMIN';

  const { data: incident, isLoading, error, refetch } = useQuery({
    queryKey: ['incident', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_incidents')
        .select('*')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data as EmergencyIncident | null;
    },
    enabled: !!id,
    refetchInterval: 5000,
  });

  const { data: device } = useQuery({
    queryKey: ['incident-device', incident?.device_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('devices')
        .select('*')
        .eq('id', incident!.device_id!)
        .maybeSingle();
      return data as Device | null;
    },
    enabled: !!incident?.device_id,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['incident-user', incident?.user_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', incident!.user_id)
        .maybeSingle();
      return data as Profile | null;
    },
    enabled: !!incident?.user_id && isResponder,
  });

  const { data: locations } = useQuery({
    queryKey: ['incident-locations', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('incident_locations')
        .select('*')
        .eq('incident_id', id!)
        .order('timestamp', { ascending: true });
      return data as IncidentLocation[];
    },
    enabled: !!id,
    refetchInterval: 10000,
  });

  const { data: media } = useQuery({
    queryKey: ['incident-media', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('incident_media')
        .select('*')
        .eq('incident_id', id!)
        .order('timestamp', { ascending: true });
      return data as IncidentMedia[];
    },
    enabled: !!id,
  });

  const { data: logs } = useQuery({
    queryKey: ['incident-logs', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('incident_id', id!)
        .order('timestamp', { ascending: true });
      return data as ActivityLog[];
    },
    enabled: !!id,
    refetchInterval: 5000,
  });

  const latestLocation = locations?.[locations.length - 1];
  const isActive = incident && incident.status !== 'RESOLVED';

  if (isLoading) {
    return (
      <UserSidebarLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-32 mb-6" />
          <div className="grid lg:grid-cols-2 gap-4">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </UserSidebarLayout>
    );
  }

  if (error || !incident) {
    return (
      <UserSidebarLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <ErrorState message="Could not load this incident. It may have been removed." onRetry={() => refetch()} />
        </div>
      </UserSidebarLayout>
    );
  }

  const content = (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Link
        to={isResponder ? '/responder' : '/dashboard'}
        className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-navy-200 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {isResponder ? 'Back to Response Center' : 'Back to Dashboard'}
      </Link>

      {isActive && (
        <div className="mb-6 rounded-xl border border-emergency-500/40 bg-emergency-500/10 p-4 animate-pulse-emergency">
          <div className="flex items-center gap-3">
            <Siren className="h-8 w-8 text-emergency-400" />
            <div>
              <h1 className="text-xl font-bold text-emergency-400">EMERGENCY ACTIVE</h1>
              <p className="text-sm text-navy-200">Incident {incident.incident_code}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <InfoCard label="Incident ID" value={incident.incident_code} mono />
        <InfoCard
          label="Status"
          value={STATUS_LABELS[incident.status]}
          badge={<Badge color={STATUS_COLORS[incident.status]}>{incident.status.replace('_', ' ')}</Badge>}
        />
        <InfoCard
          label="Priority"
          value={incident.priority}
          badge={<Badge color={PRIORITY_COLORS[incident.priority]}>{incident.priority}</Badge>}
        />
        <InfoCard label="Activated" value={formatDateTime(incident.activated_at)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-info-400" /> Location
                </span>
              </CardTitle>
              <Badge color="bg-navy-700/40 text-navy-300 border-navy-600/40">SIMULATED GPS DATA</Badge>
            </CardHeader>
            <div className="space-y-3">
              {latestLocation && (
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-navy-400 uppercase">Latitude</p>
                    <p className="font-mono text-navy-100">{latestLocation.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 uppercase">Longitude</p>
                    <p className="font-mono text-navy-100">{latestLocation.longitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 uppercase">Accuracy</p>
                    <p className="font-mono text-navy-100">±{latestLocation.accuracy}m</p>
                  </div>
                </div>
              )}
              <MapView locations={locations || []} className="h-80 rounded-lg" />
              <p className="text-xs text-navy-400 italic">SIMULATED GPS — Location data is simulated for prototype demonstration</p>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-6">
            <AudioMonitor />
            <VideoMonitor deviceId={device?.device_uid} />
          </div>

          {device && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-info-400" /> Device Status
                  </span>
                </CardTitle>
                <Badge color="bg-navy-700/40 text-navy-300 border-navy-600/40">SIMULATED DEVICE</Badge>
              </CardHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <DeviceStat icon={Cpu} label="Device" value={device.device_uid} status={device.status} />
                <DeviceStat icon={Battery} label="Battery" value={`${device.battery}%`} status={device.battery > 50 ? 'READY' : 'WARNING'} />
                <DeviceStat icon={Wifi} label="Network" value={device.network_status} status={device.network_status} />
                <DeviceStat icon={Satellite} label="GPS" value={device.gps_status} status={device.gps_status} />
                <DeviceStat icon={Camera} label="Camera" value={device.camera_status} status={device.camera_status} />
                <DeviceStat icon={Mic} label="Microphone" value={device.microphone_status} status={device.microphone_status} />
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning-400" /> Prototype Risk Analysis
                </span>
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-navy-400 uppercase">Risk Level</span>
                  <Badge color={PRIORITY_COLORS[incident.priority as keyof typeof PRIORITY_COLORS]}>{incident.risk_level}</Badge>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-navy-400 uppercase">Confidence</span>
                  <span className="text-sm font-mono text-navy-100">{(incident.risk_confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-warning-500 to-emergency-500 rounded-full"
                    style={{ width: `${incident.risk_confidence * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-navy-300 italic">{incident.risk_reason}</p>
              <p className="text-[10px] text-navy-500 pt-2 border-t border-navy-800">
                Prototype risk engine (rule-based). Future AI will add voice distress detection, stress detection, and false alarm filtering.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-info-400" /> Duration
                </span>
              </CardTitle>
            </CardHeader>
            <p className="text-2xl font-mono font-bold text-white">
              {duration(incident.activated_at, incident.resolved_at)}
            </p>
            {incident.resolved_at && (
              <p className="text-xs text-success-400 mt-1">Resolved at {formatDateTime(incident.resolved_at)}</p>
            )}
          </Card>

          <Timeline logs={logs || []} />
        </div>
      </div>
    </div>
  );

  return <UserSidebarLayout>{content}</UserSidebarLayout>;
}

function InfoCard({ label, value, mono, badge }: { label: string; value: string; mono?: boolean; badge?: React.ReactNode }) {
  return (
    <Card>
      <p className="text-xs text-navy-400 uppercase tracking-wider mb-1">{label}</p>
      {badge || <p className={cn('text-sm font-semibold text-white', mono && 'font-mono')}>{value}</p>}
    </Card>
  );
}

function DeviceStat({ icon: Icon, label, value, status }: { icon: typeof Cpu; label: string; value: string; status: string }) {
  const isReady = status === 'READY' || status === 'ONLINE' || status === 'CONNECTED' || status === 'ACTIVE';
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-navy-800/30 p-3">
      <Icon className={cn('h-4 w-4 flex-shrink-0', isReady ? 'text-success-400' : 'text-warning-400')} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-navy-400 uppercase">{label}</p>
        <p className="text-xs font-semibold text-navy-100 truncate">{value}</p>
      </div>
      <StatusDot color={isReady ? 'bg-success-400' : 'bg-warning-400'} />
    </div>
  );
}
