import { useNavigate } from 'react-router-dom';
import { Siren, AlertTriangle, Clock, CheckCircle2, ArrowRight, Radio } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ResponderSidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StatusDot } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { STATUS_COLORS, PRIORITY_COLORS, STATUS_LABELS } from '@/lib/constants';
import { formatDateTime, timeAgo, cn } from '@/lib/utils';
import type { EmergencyIncident, Profile } from '@/lib/types';

export function ResponderDashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['responder-stats'],
    queryFn: async () => {
      const { data: all } = await supabase
        .from('emergency_incidents')
        .select('status, priority, created_at, resolved_at');
      const incidents = all || [];
      const today = new Date().toDateString();
      return {
        active: incidents.filter((i) => i.status !== 'RESOLVED').length,
        critical: incidents.filter((i) => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length,
        awaiting: incidents.filter((i) => i.status === 'TRIGGERED' || i.status === 'ALERT_GENERATED').length,
        resolvedToday: incidents.filter((i) => i.status === 'RESOLVED' && i.resolved_at && new Date(i.resolved_at).toDateString() === today).length,
      };
    },
    refetchInterval: 5000,
  });

  const { data: activeIncidents } = useQuery({
    queryKey: ['responder-active-incidents'],
    queryFn: async () => {
      const { data } = await supabase
        .from('emergency_incidents')
        .select('*')
        .neq('status', 'RESOLVED')
        .order('created_at', { ascending: false });
      return data as EmergencyIncident[];
    },
    refetchInterval: 5000,
  });

  const { data: profiles } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*');
      return data as Profile[];
    },
  });

  const getProfile = (uid: string) => profiles?.find((p) => p.id === uid);

  return (
    <ResponderSidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <PageHeader
          title="Emergency Response Center"
          subtitle="Real-time emergency monitoring and incident management"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)
          ) : (
            <>
              <StatCard
                icon={Siren}
                label="Active Emergencies"
                value={stats?.active || 0}
                color={stats?.active ? 'emergency' : 'navy'}
                pulse={!!stats?.active}
              />
              <StatCard
                icon={AlertTriangle}
                label="Critical Incidents"
                value={stats?.critical || 0}
                color={stats?.critical ? 'emergency' : 'navy'}
              />
              <StatCard
                icon={Clock}
                label="Awaiting Response"
                value={stats?.awaiting || 0}
                color={stats?.awaiting ? 'warning' : 'navy'}
              />
              <StatCard
                icon={CheckCircle2}
                label="Resolved Today"
                value={stats?.resolvedToday || 0}
                color="success"
              />
            </>
          )}
        </div>

        {/* Active incidents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="h-5 w-5 text-info-400" /> Active Incidents
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/responder/active')}>
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {activeIncidents && activeIncidents.length > 0 ? (
            <div className="space-y-3">
              {activeIncidents.slice(0, 5).map((inc) => {
                const profile = getProfile(inc.user_id);
                return (
                  <Card
                    key={inc.id}
                    className="hover:border-emergency-500/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/responder/incidents/${inc.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0',
                          inc.status === 'TRIGGERED' || inc.status === 'ALERT_GENERATED'
                            ? 'bg-emergency-500/20 animate-pulse'
                            : 'bg-warning-500/10'
                        )}>
                          <Siren className={cn(
                            'h-5 w-5',
                            inc.status === 'TRIGGERED' || inc.status === 'ALERT_GENERATED'
                              ? 'text-emergency-400'
                              : 'text-warning-400'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-bold text-white">{inc.incident_code}</span>
                            <Badge color={STATUS_COLORS[inc.status]}>{STATUS_LABELS[inc.status]}</Badge>
                            <Badge color={PRIORITY_COLORS[inc.priority]}>{inc.priority}</Badge>
                          </div>
                          <p className="text-xs text-navy-400 mt-1">
                            {profile?.name || 'Unknown user'} • {timeAgo(inc.activated_at)}
                          </p>
                        </div>
                      </div>
                      <Button variant="danger" size="sm" className="flex-shrink-0">
                        Respond <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={CheckCircle2}
                title="No active emergencies"
                description="All clear. New incidents will appear here in real time."
              />
            </Card>
          )}
        </div>
      </div>
    </ResponderSidebarLayout>
  );
}

function StatCard({
  icon: Icon, label, value, color, pulse,
}: {
  icon: typeof Siren;
  label: string;
  value: number;
  color: 'emergency' | 'warning' | 'success' | 'navy';
  pulse?: boolean;
}) {
  const colors = {
    emergency: 'text-emergency-400 bg-emergency-500/10',
    warning: 'text-warning-400 bg-warning-500/10',
    success: 'text-success-400 bg-success-500/10',
    navy: 'text-navy-300 bg-navy-800/50',
  };
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className={cn('rounded-lg p-2', colors[color])}>
          <Icon className="h-5 w-5" />
        </div>
        {pulse && value > 0 && <StatusDot color="bg-emergency-400" pulse />}
      </div>
      <p className="text-xs text-navy-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={cn(
        'text-2xl font-bold',
        color === 'emergency' && 'text-emergency-400',
        color === 'warning' && 'text-warning-400',
        color === 'success' && 'text-success-400',
        color === 'navy' && 'text-white',
      )}>{value}</p>
    </Card>
  );
}
