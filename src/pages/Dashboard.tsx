import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Siren, Shield, Cpu, Battery, Clock, AlertTriangle, Loader2, RotateCcw, Activity } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UserSidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge, StatusDot } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { triggerEmergency, resetDemoData } from '@/services/emergencyService';
import { timeAgo, cn } from '@/lib/utils';
import type { Device, EmergencyIncident } from '@/lib/types';

export function Dashboard() {
  const { profile, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showTrigger, setShowTrigger] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [resetting, setResetting] = useState(false);

  const { data: device, isLoading: deviceLoading } = useQuery({
    queryKey: ['device', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', session!.user!.id)
        .maybeSingle();
      return data as Device | null;
    },
    enabled: !!session?.user?.id,
    refetchInterval: 15000,
  });

  const { data: activeIncident } = useQuery({
    queryKey: ['active-incident', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('emergency_incidents')
        .select('*')
        .eq('user_id', session!.user!.id)
        .neq('status', 'RESOLVED')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as EmergencyIncident | null;
    },
    enabled: !!session?.user?.id,
    refetchInterval: 5000,
  });

  const { data: incidents } = useQuery({
    queryKey: ['incidents', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('emergency_incidents')
        .select('*')
        .eq('user_id', session!.user!.id)
        .order('created_at', { ascending: false });
      return data as EmergencyIncident[];
    },
    enabled: !!session?.user?.id,
  });

  const triggerMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !device?.id) throw new Error('No device found');
      return triggerEmergency(session.user.id, device.id);
    },
    onSuccess: (result) => {
      if (result.error) {
        toast('error', 'Trigger failed', result.error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['active-incident'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast('success', 'Emergency Activated', `Incident ${result.data?.incident.incident_code} created`);
      setShowTrigger(false);
      navigate(`/incidents/${result.data?.incident.id}`);
    },
    onError: (err: Error) => {
      toast('error', 'Trigger failed', err.message);
    },
  });

  const handleTrigger = () => {
    setTriggering(true);
    triggerMutation.mutate(undefined, {
      onSettled: () => setTriggering(false),
    });
  };

  const handleReset = async () => {
    if (!session?.user?.id) return;
    setResetting(true);
    const { error } = await resetDemoData(session.user.id);
    setResetting(false);
    if (error) {
      toast('error', 'Reset failed', error);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['active-incident'] });
    queryClient.invalidateQueries({ queryKey: ['incidents'] });
    toast('success', 'Demo reset', 'All active incidents cleared. System is SAFE.');
  };

  const totalIncidents = incidents?.length || 0;
  const resolvedIncidents = incidents?.filter((i) => i.status === 'RESOLVED').length || 0;
  const isSafe = !activeIncident;

  return (
    <UserSidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <PageHeader
          title={`Hello, ${profile?.name?.split(' ')[0] || 'User'}`}
          subtitle="Your personal safety dashboard"
          actions={
            <Button variant="outline" size="sm" onClick={handleReset} loading={resetting}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset Demo
            </Button>
          }
        />

        {/* Active emergency banner */}
        {activeIncident && (
          <div
            className="mb-6 rounded-xl border border-emergency-500/40 bg-emergency-500/10 p-4 animate-pulse-emergency cursor-pointer"
            onClick={() => navigate(`/incidents/${activeIncident.id}`)}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-emergency-400" />
              <div className="flex-1">
                <p className="font-bold text-emergency-400">EMERGENCY ACTIVE</p>
                <p className="text-sm text-navy-200">
                  Incident {activeIncident.incident_code} — {activeIncident.status.replace('_', ' ')}
                </p>
              </div>
              <Button variant="danger" size="sm">View Incident</Button>
            </div>
          </div>
        )}

        {/* Status cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {deviceLoading ? (
            <>
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </>
          ) : (
            <>
              <StatCard
                icon={Shield}
                label="Safety Status"
                value={isSafe ? 'SAFE' : 'ACTIVE'}
                color={isSafe ? 'success' : 'emergency'}
                pulse={!isSafe}
              />
              <StatCard
                icon={Cpu}
                label="Device Status"
                value={device?.status || 'OFFLINE'}
                color={device?.status === 'ONLINE' ? 'success' : 'warning'}
              />
              <StatCard
                icon={Battery}
                label="Battery"
                value={`${device?.battery ?? 0}%`}
                color={(device?.battery ?? 0) > 50 ? 'success' : 'warning'}
              />
              <StatCard
                icon={Clock}
                label="Last Connection"
                value={device ? timeAgo(device.last_connected) : '—'}
                color="info"
              />
            </>
          )}
        </div>

        {/* Incident counts + trigger */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Incidents</CardTitle>
              <Activity className="h-4 w-4 text-navy-400" />
            </CardHeader>
            <p className="text-3xl font-bold text-white">{totalIncidents}</p>
            <p className="text-xs text-navy-400 mt-1">All time</p>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Resolved Incidents</CardTitle>
              <Shield className="h-4 w-4 text-success-400" />
            </CardHeader>
            <p className="text-3xl font-bold text-white">{resolvedIncidents}</p>
            <p className="text-xs text-navy-400 mt-1">Successfully resolved</p>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Device ID</CardTitle>
              <Cpu className="h-4 w-4 text-navy-400" />
            </CardHeader>
            <p className="text-3xl font-bold text-white font-mono">{device?.device_uid || '—'}</p>
            <p className="text-xs text-navy-400 mt-1">{device?.firmware_version || 'Firmware unknown'}</p>
          </Card>
        </div>

        {/* Trigger button */}
        <Card className={cn('border-2', isSafe ? 'border-navy-700' : 'border-emergency-500/30')}>
          <div className="flex flex-col items-center text-center py-8">
            <div className={cn(
              'mb-6 rounded-full p-6 transition-all',
              isSafe ? 'bg-navy-800/50' : 'bg-emergency-500/10 animate-pulse'
            )}>
              <Siren className={cn(
                'h-12 w-12',
                isSafe ? 'text-navy-400' : 'text-emergency-400'
              )} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {isSafe ? 'Simulate Silent Trigger' : 'Emergency In Progress'}
            </h2>
            <p className="text-sm text-navy-300 mb-6 max-w-md">
              {isSafe
                ? 'This will simulate a silent trigger activation from your device. An emergency incident will be created with simulated GPS, audio, and video data.'
                : 'An active emergency is already in progress. View the incident or reset the demo to start over.'}
            </p>
            {isSafe ? (
              <Button
                variant="danger"
                size="xl"
                onClick={() => setShowTrigger(true)}
              >
                <Siren className="h-5 w-5" /> SIMULATE SILENT TRIGGER
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="danger" size="lg" onClick={() => navigate(`/incidents/${activeIncident.id}`)}>
                  View Active Incident
                </Button>
                <Button variant="outline" size="lg" onClick={handleReset} loading={resetting}>
                  Reset Demo
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={showTrigger}
        onClose={() => setShowTrigger(false)}
        onConfirm={handleTrigger}
        title="Activate Emergency Simulation?"
        message="This will create a real emergency incident in the database with simulated GPS, audio, and video data. The responder dashboard will be notified immediately."
        confirmLabel="Activate Emergency"
        variant="danger"
        loading={triggering}
      />
    </UserSidebarLayout>
  );
}

function StatCard({
  icon: Icon, label, value, color, pulse,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
  color: 'success' | 'emergency' | 'warning' | 'info';
  pulse?: boolean;
}) {
  const colors = {
    success: 'text-success-400 bg-success-500/10',
    emergency: 'text-emergency-400 bg-emergency-500/10',
    warning: 'text-warning-400 bg-warning-500/10',
    info: 'text-info-400 bg-info-500/10',
  };
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className={cn('rounded-lg p-2', colors[color])}>
          <Icon className="h-5 w-5" />
        </div>
        {pulse && <StatusDot color="bg-emergency-400" pulse />}
      </div>
      <p className="text-xs text-navy-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={cn(
        'text-xl font-bold',
        color === 'success' && 'text-success-400',
        color === 'emergency' && 'text-emergency-400',
        color === 'warning' && 'text-warning-400',
        color === 'info' && 'text-info-400',
      )}>{value}</p>
    </Card>
  );
}
