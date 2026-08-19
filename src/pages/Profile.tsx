import { useState } from 'react';
import { User as UserIcon, Mail, Phone, Cpu, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UserSidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Device, EmergencyContact } from '@/lib/types';

export function Profile() {
  const { profile, session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

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
  });

  const { data: contacts } = useQuery({
    queryKey: ['contacts', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', session!.user!.id)
        .order('priority', { ascending: true });
      return data as EmergencyContact[];
    },
    enabled: !!session?.user?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ name, phone, updated_at: new Date().toISOString() })
        .eq('id', session!.user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast('success', 'Profile updated', 'Your changes have been saved');
    },
    onError: (err: Error) => toast('error', 'Update failed', err.message),
  });

  return (
    <UserSidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <PageHeader title="Profile" subtitle="Your account information" />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <Badge color="bg-info-500/20 text-info-400 border-info-500/40">{profile?.role}</Badge>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-info-500/20 to-info-700/20 border border-info-500/30">
                  <span className="text-2xl font-bold text-info-400">
                    {(name || profile?.name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{name || profile?.name}</p>
                  <p className="text-sm text-navy-300">{session?.user?.email}</p>
                </div>
              </div>

              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Email" value={session?.user?.email || ''} disabled />

              <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </Card>

          {/* Side info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-info-400" /> Registered Device
                  </span>
                </CardTitle>
              </CardHeader>
              {deviceLoading ? (
                <Skeleton className="h-16" />
              ) : device ? (
                <div className="space-y-2 text-sm">
                  <InfoRow label="Device" value={device.device_uid} />
                  <InfoRow label="Name" value={device.name} />
                  <InfoRow label="Status" value={device.status} />
                  <InfoRow label="Firmware" value={device.firmware_version} />
                </div>
              ) : (
                <p className="text-sm text-navy-400">No device registered</p>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-info-400" /> Emergency Contacts
                  </span>
                </CardTitle>
              </CardHeader>
              {contacts && contacts.length > 0 ? (
                <div className="space-y-2">
                  {contacts.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 text-sm">
                      <UserIcon className="h-3.5 w-3.5 text-navy-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-navy-100 truncate">{c.name}</p>
                        <p className="text-xs text-navy-400 font-mono">{c.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-navy-400">No contacts added</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </UserSidebarLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-navy-400">{label}</span>
      <span className="text-navy-100 font-medium">{value}</span>
    </div>
  );
}
