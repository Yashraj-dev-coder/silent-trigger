import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Siren, MapPin, Cpu, Battery, Wifi, Satellite, Camera, Mic,
  AlertTriangle, Clock, CheckCircle2, Radio, User as UserIcon, Phone,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { ResponderSidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StatusDot } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapView } from '@/components/MapView';
import { AudioMonitor } from '@/components/AudioMonitor';
import { VideoMonitor } from '@/components/VideoMonitor';
import { Timeline } from '@/components/Timeline';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/Modal';
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS } from '@/lib/constants';
import { updateIncidentStatus } from '@/services/emergencyService';
import { formatDateTime, duration, cn } from '@/lib/utils';
import type { EmergencyIncident, Device, IncidentLocation, ActivityLog, Profile, EmergencyContact } from '@/lib/types';

export function ResponderIncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<'ACKNOWLEDGED' | 'RESPONDING' | 'RESOLVED' | null>(null);

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
    enabled: !!incident?.user_id,
  });

  const { data: contacts } = useQuery({
    queryKey: ['user-contacts', incident?.user_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', incident!.user_id)
        .order('priority', { ascending: true });
      return data as EmergencyContact[];
    },
    enabled: !!incident?.user_id,
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

  const statusMutation = useMutation({
    mutationFn: async (newStatus: 'ACKNOWLEDGED' | 'RESPONDING' | 'RESOLVED') => {
      if (!id) throw new Error('No incident ID');
      return updateIncidentStatus(id, newStatus);
    },
    onSuccess: (result) => {
      if (result.error) {
        toast('error', 'Action failed', result.error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      queryClient.invalidateQueries({ queryKey: ['incident-logs', id] });
      queryClient.invalidateQueries({ queryKey: ['responder-active-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['responder-stats'] });
      queryClient.invalidateQueries({ queryKey: ['responder-incidents'] });
      toast('success', 'Status updated', `Incident ${confirmAction?.toLowerCase()}`);
      setConfirmAction(null);
    },
    onError: (err: Error) => {
      toast('error', 'Action failed', err.message);
      setConfirmAction(null);
    },
  });

  if (isLoading) {
    return (
      <ResponderSidebarLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-32 mb-6" />
          <div className="grid lg:grid-cols-2 gap-4">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </ResponderSidebarLayout>
    );
  }

  if (error || !incident) {
    return (
      <ResponderSidebarLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <ErrorState message="Could not load this incident." onRetry={() => refetch()} />
        </div>
      </ResponderSidebarLayout>
    );
  }

  const isActive = incident.status !== 'RESOLVED';
  const latestLocation = locations?.[locations.length - 1];

  const canAcknowledge = incident.status === 'TRIGGERED' || incident.status === 'ALERT_GENERATED';
  const canRespond = incident.status === 'ACKNOWLEDGED';
  const canResolve = incident.status === 'ACKNOWLEDGED' || incident.status === 'RESPONDING';

  const confirmMessages: Record<string, { title: string; message: string; label: string }> = {
    ACKNOWLEDGED: { title: 'Acknowledge Incident?', message: 'This confirms you have received and are reviewing this emergency.', label: 'Acknowledge Incident' },
    RESPONDING: { title: 'Mark as Responding?', message: 'This indicates responders are en route to the incident location.', label: 'Mark Responding' },
    RESOLVED: { title: 'Resolve Incident?', message: 'This will close the incident and move it to history. This action cannot be undone.', label: 'Resolve Incident' },
  };

  return (
    <ResponderSidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <Link
          to="/responder"
          className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-navy-200 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Response Center
        </Link>

        {isActive && (
          <div className="mb-6 rounded-xl border border-emergency-500/40 bg-emergency-500/10 p-4 animate-pulse-emergency">
            <div className="flex items-center gap-3">
              <Siren className="h-8 w-8 text-emergency-400" />
              <div className="flex-1">
                <h1 className="text-xl font-bold text-emergency-400">EMERGENCY ACTIVE</h1>
                <p className="text-sm text-navy-200">Incident {incident.incident_code} — {userProfile?.name}</p>
              </div>
              <Badge color={STATUS_COLORS[incident.status]}>{STATUS_LABELS[incident.status]}</Badge>
            </div>
          </div>
        )}

        {/* Incident info */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card><p className="text-xs text-navy-400 uppercase mb-1">Incident ID</p><p className="font-mono text-sm font-bold text-white">{incident.incident_code}</p></Card>
          <Card><p className="text-xs text-navy-400 uppercase mb-1">Status</p><Badge color={STATUS_COLORS[incident.status]}>{STATUS_LABELS[incident.status]}</Badge></Card>
          <Card><p className="text-xs text-navy-400 uppercase mb-1">Priority</p><Badge color={PRIORITY_COLORS[incident.priority]}>{incident.priority}</Badge></Card>
          <Card><p className="text-xs text-navy-400 uppercase mb-1">Activated</p><p className="text-sm text-white">{formatDateTime(incident.activated_at)}</p></Card>
        </div>

        {/* Action buttons */}
        {isActive && (
          <Card className="mb-6 border-info-500/20">
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-info-400" /> Response Actions
                </span>
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="warning"
                size="md"
                disabled={!canAcknowledge}
                onClick={() => setConfirmAction('ACKNOWLEDGED')}
              >
                <CheckCircle2 className="h-4 w-4" /> Acknowledge Incident
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={!canRespond}
                onClick={() => setConfirmAction('RESPONDING')}
              >
                <Radio className="h-4 w-4" /> Mark Responding
              </Button>
              <Button
                variant="success"
                size="md"
                disabled={!canResolve}
                onClick={() => setConfirmAction('RESOLVED')}
              >
                <CheckCircle2 className="h-4 w-4" /> Resolve Incident
              </Button>
            </div>
            {!canAcknowledge && !canRespond && !canResolve && (
              <p className="text-xs text-navy-400 mt-3">No further actions available — incident is resolved.</p>
            )}
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: map + media + device */}
          <div className="lg:col-span-2 space-y-6">
            {/* User info */}
            {userProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <span className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-info-400" /> User Information
                    </span>
                  </CardTitle>
                </CardHeader>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-navy-400 uppercase">Name</p>
                    <p className="text-sm text-white font-medium">{userProfile.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 uppercase">Phone</p>
                    <p className="text-sm text-white font-mono flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-navy-400" /> {userProfile.phone || '—'}
                    </p>
                  </div>
                </div>
                {contacts && contacts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-navy-800">
                    <p className="text-xs text-navy-400 uppercase mb-2">Emergency Contacts</p>
                    <div className="space-y-1.5">
                      {contacts.map((c) => (
                        <div key={c.id} className="flex items-center gap-2 text-sm">
                          <UserIcon className="h-3 w-3 text-navy-400" />
                          <span className="text-navy-100">{c.name}</span>
                          <span className="text-navy-400 text-xs">({c.relationship})</span>
                          <span className="text-navy-300 font-mono text-xs ml-auto">{c.phone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-info-400" /> Location
                  </span>
                </CardTitle>
                <Badge color="bg-navy-700/40 text-navy-300 border-navy-600/40">SIMULATED GPS DATA</Badge>
              </CardHeader>
              {latestLocation && (
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div><p className="text-xs text-navy-400 uppercase">Latitude</p><p className="font-mono text-navy-100">{latestLocation.latitude.toFixed(6)}</p></div>
                  <div><p className="text-xs text-navy-400 uppercase">Longitude</p><p className="font-mono text-navy-100">{latestLocation.longitude.toFixed(6)}</p></div>
                  <div><p className="text-xs text-navy-400 uppercase">Accuracy</p><p className="font-mono text-navy-100">±{latestLocation.accuracy}m</p></div>
                </div>
              )}
              <MapView locations={locations || []} className="h-80 rounded-lg" />
              <p className="text-xs text-navy-400 italic mt-2">SIMULATED GPS — Location data is simulated for prototype demonstration</p>
            </Card>

            {/* Audio + Video */}
            <div className="grid sm:grid-cols-2 gap-6">
              <AudioMonitor />
              <VideoMonitor deviceId={device?.device_uid} />
            </div>

            {/* Device */}
            {device && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <span className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-info-400" /> Device
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

          {/* Right: risk + duration + timeline */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning-400" /> Risk Analysis
                  </span>
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-navy-400 uppercase">Risk Level</span>
                  <Badge color={PRIORITY_COLORS[incident.priority as keyof typeof PRIORITY_COLORS]}>{incident.risk_level}</Badge>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-navy-400 uppercase">Confidence</span>
                    <span className="text-sm font-mono text-navy-100">{(incident.risk_confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-warning-500 to-emergency-500 rounded-full" style={{ width: `${incident.risk_confidence * 100}%` }} />
                  </div>
                </div>
                <p className="text-xs text-navy-300 italic">{incident.risk_reason}</p>
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
              <p className="text-2xl font-mono font-bold text-white">{duration(incident.activated_at, incident.resolved_at)}</p>
              {incident.resolved_at && <p className="text-xs text-success-400 mt-1">Resolved at {formatDateTime(incident.resolved_at)}</p>}
            </Card>

            <Timeline logs={logs || []} />
          </div>
        </div>
      </div>

      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => statusMutation.mutate(confirmAction)}
          title={confirmMessages[confirmAction].title}
          message={confirmMessages[confirmAction].message}
          confirmLabel={confirmMessages[confirmAction].label}
          variant={confirmAction === 'RESOLVED' ? 'success' : confirmAction === 'ACKNOWLEDGED' ? 'primary' : 'danger'}
          loading={statusMutation.isPending}
        />
      )}
    </ResponderSidebarLayout>
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
