import { Users, Cpu, ScrollText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ResponderSidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Profile, Device, ActivityLog, EmergencyIncident } from '@/lib/types';

export function ResponderUsers() {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return data as Profile[];
    },
  });

  return (
    <ResponderSidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <PageHeader title="Users" subtitle="All registered users in the system" />
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : profiles && profiles.length > 0 ? (
          <div className="space-y-3">
            {profiles.map((p) => (
              <Card key={p.id}>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info-500/10 text-sm font-bold text-info-400">
                    {p.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{p.name || 'Unnamed'}</p>
                    <p className="text-xs text-navy-400 font-mono">{p.phone || 'No phone'}</p>
                  </div>
                  <Badge color={p.role === 'RESPONDER' ? 'bg-warning-500/20 text-warning-400 border-warning-500/40' : 'bg-info-500/20 text-info-400 border-info-500/40'}>
                    {p.role}
                  </Badge>
                  <span className="text-xs text-navy-400 hidden sm:block">{formatDate(p.created_at)}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card><EmptyState icon={Users} title="No users found" /></Card>
        )}
      </div>
    </ResponderSidebarLayout>
  );
}

export function ResponderDevices() {
  const { data: devices, isLoading } = useQuery({
    queryKey: ['all-devices'],
    queryFn: async () => {
      const { data } = await supabase.from('devices').select('*').order('created_at', { ascending: false });
      return data as (Device & { user_id: string })[];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*');
      return data as Profile[];
    },
  });

  return (
    <ResponderSidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <PageHeader title="Devices" subtitle="All registered Silent Trigger devices" />
        <div className="mb-4">
          <Badge color="bg-navy-700/40 text-navy-300 border-navy-600/40">SIMULATED DEVICE DATA</Badge>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
        ) : devices && devices.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {devices.map((d) => {
              const owner = profiles?.find((p) => p.id === d.user_id);
              return (
                <Card key={d.id}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-500/10">
                      <Cpu className="h-5 w-5 text-info-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{d.name}</p>
                      <p className="text-xs text-navy-400 font-mono">{d.device_uid}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge color="bg-success-500/20 text-success-400 border-success-500/40">{d.status}</Badge>
                        <Badge color="bg-navy-700/40 text-navy-300 border-navy-600/40">Battery: {d.battery}%</Badge>
                      </div>
                      <p className="text-xs text-navy-400 mt-2">Owner: {owner?.name || 'Unknown'}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card><EmptyState icon={Cpu} title="No devices registered" /></Card>
        )}
      </div>
    </ResponderSidebarLayout>
  );
}

export function ResponderLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['all-logs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('activity_logs')
        .select('*, emergency_incidents(incident_code)')
        .order('timestamp', { ascending: false })
        .limit(100);
      return data as (ActivityLog & { emergency_incidents: { incident_code: string } | null })[];
    },
  });

  return (
    <ResponderSidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <PageHeader title="Activity Logs" subtitle="System-wide incident activity history" />
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <Card key={log.id} className="py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 flex-shrink-0">
                    <ScrollText className="h-4 w-4 text-navy-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-100">{log.event}</p>
                    <p className="text-xs text-navy-400 truncate">{log.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-mono text-navy-300">{log.emergency_incidents?.incident_code || '—'}</p>
                    <p className="text-[10px] text-navy-500">{formatDateTime(log.timestamp)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card><EmptyState icon={ScrollText} title="No activity logs" description="Activity will appear here when incidents are triggered." /></Card>
        )}
      </div>
    </ResponderSidebarLayout>
  );
}
