import { Cpu, Battery, Wifi, Satellite, Camera, Mic, RefreshCw, Activity } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UserSidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StatusDot } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { timeAgo, cn } from '@/lib/utils';
import type { Device } from '@/lib/types';

export function DevicePage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: device, isLoading } = useQuery({
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
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      if (!device?.id) throw new Error('No device');
      const { error } = await supabase
        .from('devices')
        .update({
          last_connected: new Date().toISOString(),
          battery: Math.max(50, (device.battery ?? 87) - Math.floor(Math.random() * 3)),
        })
        .eq('id', device.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device'] });
      toast('success', 'Device refreshed', 'Simulated device status updated');
    },
    onError: (err: Error) => toast('error', 'Refresh failed', err.message),
  });

  return (
    <UserSidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <PageHeader
          title="My Device"
          subtitle="Simulated Silent Trigger hardware unit"
          actions={
            <Button variant="outline" size="sm" onClick={() => refreshMutation.mutate()} loading={refreshMutation.isPending}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          }
        />

        <div className="mb-4">
          <Badge color="bg-navy-700/40 text-navy-300 border-navy-600/40">SIMULATED DEVICE STATUS</Badge>
        </div>

        {isLoading ? (
          <Skeleton className="h-64" />
        ) : device ? (
          <>
            {/* Device identity card */}
            <Card className="mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-info-500/20 to-info-700/20 border border-info-500/30">
                  <Cpu className="h-8 w-8 text-info-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">{device.name}</h2>
                  <p className="text-sm text-navy-300 font-mono">{device.device_uid}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge color="bg-success-500/20 text-success-400 border-success-500/40" pulse>
                      <StatusDot color="bg-success-400" pulse /> {device.status}
                    </Badge>
                    <Badge color="bg-navy-700/40 text-navy-300 border-navy-600/40">
                      Firmware {device.firmware_version}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Status grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <DeviceStatusCard icon={Battery} label="Battery" value={`${device.battery}%`} status={device.battery > 50 ? 'good' : 'warning'} />
              <DeviceStatusCard icon={Wifi} label="Network" value={device.network_status} status="good" />
              <DeviceStatusCard icon={Satellite} label="GPS" value={device.gps_status} status="good" />
              <DeviceStatusCard icon={Camera} label="Camera" value={device.camera_status} status="good" />
              <DeviceStatusCard icon={Mic} label="Microphone" value={device.microphone_status} status="good" />
              <DeviceStatusCard icon={Activity} label="Last Connected" value={timeAgo(device.last_connected)} status="info" />
            </div>

            {/* Proposed hardware section */}
            <Card className="mt-6 border-warning-500/20">
              <CardHeader>
                <CardTitle>Proposed Hardware Components</CardTitle>
                <Badge color="bg-warning-500/20 text-warning-400 border-warning-500/40">FUTURE IMPLEMENTATION</Badge>
              </CardHeader>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {[
                  'Silent trigger mechanism (hidden button)',
                  'Microcontroller (ESP32 or similar)',
                  'GPS module for location tracking',
                  'Camera module for video evidence',
                  'Microphone for audio capture',
                  'GSM/4G/LTE cellular communication',
                  'Rechargeable battery',
                  'Accelerometer / gyroscope (optional)',
                ].map((comp) => (
                  <div key={comp} className="flex items-center gap-2 text-navy-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-warning-400 flex-shrink-0" />
                    {comp}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-navy-400 italic">
                The current prototype uses a software simulator. These hardware components are proposed for the next development phase.
              </p>
            </Card>
          </>
        ) : (
          <Card>
            <p className="text-sm text-navy-300 text-center py-8">No device registered yet. A demo device is created automatically on login.</p>
          </Card>
        )}
      </div>
    </UserSidebarLayout>
  );
}

function DeviceStatusCard({ icon: Icon, label, value, status }: { icon: typeof Cpu; label: string; value: string; status: 'good' | 'warning' | 'info' }) {
  const colors = {
    good: 'text-success-400 bg-success-500/10',
    warning: 'text-warning-400 bg-warning-500/10',
    info: 'text-info-400 bg-info-500/10',
  };
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className={cn('rounded-lg p-2.5', colors[status])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-navy-400 uppercase tracking-wider">{label}</p>
          <p className="text-sm font-semibold text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}
