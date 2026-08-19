import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, History, ArrowRight, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { UserSidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { STATUS_COLORS, PRIORITY_COLORS, STATUS_LABELS } from '@/lib/constants';
import { formatDateTime, duration, cn } from '@/lib/utils';
import type { EmergencyIncident, IncidentLocation } from '@/lib/types';

export function IncidentHistory() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: incidents, isLoading } = useQuery({
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

  const { data: locations } = useQuery({
    queryKey: ['all-locations', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('incident_locations')
        .select('*, incident_id')
        .in('incident_id', (incidents || []).map((i) => i.id));
      return data as IncidentLocation[];
    },
    enabled: !!incidents?.length,
  });

  const filtered = useMemo(() => {
    if (!incidents) return [];
    return incidents.filter((inc) => {
      const matchesSearch = inc.incident_code.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [incidents, search, statusFilter]);

  const getLocationFor = (incidentId: string) => {
    const locs = locations?.filter((l) => l.incident_id === incidentId) || [];
    return locs[locs.length - 1];
  };

  return (
    <UserSidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <PageHeader
          title="Incident History"
          subtitle="All your emergency incidents, past and present"
        />

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search by incident code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-navy-700 bg-navy-800/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder-navy-400 focus:border-info-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-navy-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-navy-700 bg-navy-800/50 px-3 py-2.5 text-sm text-white focus:border-info-500 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="TRIGGERED">Triggered</option>
              <option value="ALERT_GENERATED">Alert Generated</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESPONDING">Responding</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((inc) => {
              const loc = getLocationFor(inc.id);
              return (
                <Card
                  key={inc.id}
                  className="hover:border-info-500/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-white">{inc.incident_code}</span>
                        <Badge color={STATUS_COLORS[inc.status]}>{STATUS_LABELS[inc.status]}</Badge>
                        <Badge color={PRIORITY_COLORS[inc.priority]}>{inc.priority}</Badge>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-400">
                        <span>{formatDateTime(inc.activated_at)}</span>
                        {loc && (
                          <span className="font-mono">
                            {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                          </span>
                        )}
                        <span>Duration: {duration(inc.activated_at, inc.resolved_at)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      View <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={History}
              title="No incidents found"
              description={search || statusFilter !== 'ALL' ? 'Try adjusting your search or filters.' : 'When you trigger an emergency, it will appear here.'}
            />
          </Card>
        )}
      </div>
    </UserSidebarLayout>
  );
}
