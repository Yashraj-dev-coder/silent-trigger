import { Bell, Shield, Info, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UserSidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

export function Settings() {
  const { profile } = useAuth();
  const { toast } = useToast();

  return (
    <UserSidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <PageHeader title="Settings" subtitle="Manage your account and preferences" />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-info-400" /> Notification Preferences
                </span>
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <ToggleRow label="Emergency alerts" desc="Get notified when an emergency is triggered" defaultOn />
              <ToggleRow label="Incident status updates" desc="Notifications when incident status changes" defaultOn />
              <ToggleRow label="Device status warnings" desc="Alerts for low battery or connection issues" defaultOn />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-info-400" /> Security
                </span>
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <InfoRow label="Account email" value={profile?.id ? 'Verified' : 'Unverified'} />
              <InfoRow label="Role" value={profile?.role || 'USER'} />
              <InfoRow label="Account created" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'} />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-info-400" /> Demo Settings
                </span>
              </CardTitle>
              <Badge color="bg-navy-700/40 text-navy-300 border-navy-600/40">PROTOTYPE</Badge>
            </CardHeader>
            <div className="space-y-4">
              <p className="text-sm text-navy-300">
                This is a hackathon prototype. All hardware data (GPS, audio, video, device status) is simulated.
                Use the Reset Demo button on the dashboard to clear active incidents.
              </p>
              <Button
                variant="outline"
                size="md"
                onClick={() => toast('info', 'Demo info', 'All device data is SIMULATED for prototype demonstration')}
              >
                <Info className="h-4 w-4" /> About Demo Mode
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </UserSidebarLayout>
  );
}

function ToggleRow({ label, desc, defaultOn }: { label: string; desc: string; defaultOn?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-navy-100">{label}</p>
        <p className="text-xs text-navy-400">{desc}</p>
      </div>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}

function Toggle({ defaultOn }: { defaultOn?: boolean }) {
  return (
    <label className="relative inline-flex cursor-pointer">
      <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
      <div className="h-6 w-11 rounded-full bg-navy-700 peer-checked:bg-info-600 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-navy-400">{label}</span>
      <span className="text-navy-100 font-medium">{value}</span>
    </div>
  );
}
