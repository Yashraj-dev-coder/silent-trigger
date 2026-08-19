import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight, Siren, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ResponderSidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { STATUS_COLORS, PRIORITY_COLORS, STATUS_LABELS } from '@/lib/constants';
import { timeAgo, cn } from '@/lib/utils';
import type { EmergencyIncident, Profile, Device, IncidentLocation } from '@/lib/types';

export function ResponderIncidents({ resolvedOnly = false }: { resolvedOnly?: boolean }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['responder-incidents', resolvedOnly],
    queryFn: async () => {
      let query = supabase
        .from('emergency_incidents')
        .select('*')
        .order('created_at', { ascending: false });
      if (resolvedOnly) {
        query = query.eq('status', 'RESOLVED');
      } else {
        query = query.neq('status', 'RESOLVED');
      }
      const { data } = await query;
      return data as EmergencyIncident[];
    },
    refetchInterval: 5000,
  });

  const { data: profiles } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*');
      return data as Profile[];
    },
  });

  const { data: devices } = useQuery({
    queryKey: ['all-devices'],
    queryFn: async () => {
      const { data } = await supabase.from('devices').select('*');
      return data as Device[];
    },
  });

  const { data: locations } = useQuery({
    queryKey: ['all-locations-responder'],
    queryFn: async () => {
      const { data } = await supabase
        .from('incident_locations')
        .select('*')
        .order('timestamp', { ascending: true });
      return data as IncidentLocation[];
    },
  });

  const filtered = useMemo(() => {
    if (!incidents) return [];
    return incidents.filter((inc) => {
      const profile = profiles?.find((p) => p.id === inc.user_id);
      const matchesSearch =
        inc.incident_code.toLowerCase().includes(search.toLowerCase()) ||
        (profile?.name || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || inc.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [incidents, profiles, search, statusFilter, priorityFilter]);

  const getProfile = (uid: string) => profiles?.find((p) => p.id === uid);
  const getDevice = (did: string | null) => devices?.find((d) => d.id === did);
  const getLatestLoc = (incidentId: string) => {
    const locs = locations?.filter((l) => l.incident_id === incidentId) || [];
    return locs[locs.length - 1];
  };

  return (
    <ResponderSidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <PageHeader
          title={resolvedOnly ? 'Resolved Incidents' : 'Active Incidents'}
          subtitle={resolvedOnly ? 'Past emergencies that have been resolved' : 'All current emergency incidents requiring attention'}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search by incident code or user name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-navy-700 bg-navy-800/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder-navy-400 focus:border-info-500 focus:outline-none"
            />
          </div>
          {!resolvedOnly && (
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
            </select>
          )}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-navy-700 bg-navy-800/50 px-3 py-2.5 text-sm text-white focus:border-info-500 focus:outline-none"
          >
            <option value="ALL">All Priority</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-800 text-xs text-navy-400 uppercase tracking-wider">
                  <th className="text-left py-3 px-2 font-semibold">Incident</th>
                  <th className="text-left py-3 px-2 font-semibold hidden md:table-cell">User</th>
                  <th className="text-left py-3 px-2 font-semibold hidden lg:table-cell">Priority</th>
                  <th className="text-left py-3 px-2 font-semibold hidden lg:table-cell">Location</th>
                  <th className="text-left py-3 px-2 font-semibold hidden sm:table-cell">Activated</th>
                  <th className="text-left py-3 px-2 font-semibold hidden xl:table-cell">Device</th>
                  <th className="text-left py-3 px-2 font-semibold">Status</th>
                  <th className="text-right py-3 px-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc) => {
                  const profile = getProfile(inc.user_id);
                  const device = getDevice(inc.device_id);
                  const loc = getLatestLoc(inc.id);
                  return (
                    <tr
                      key={inc.id}
                      className="border-b border-navy-800/50 hover:bg-navy-800/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/responder/incidents/${inc.id}`)}
                    >
                      <td className="py-3 px-2">
                        <span className="font-mono text-sm font-bold text-white">{inc.incident_code}</span>
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <span className="text-sm text-navy-200">{profile?.name || 'Unknown'}</span>
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell">
                        <Badge color={PRIORITY_COLORS[inc.priority]}>{inc.priority}</Badge>
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell">
                        <span className="text-xs font-mono text-navy-300">
                          {loc ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}` : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <span className="text-xs text-navy-400">{timeAgo(inc.activated_at)}</span>
                      </td>
                      <td className="py-3 px-2 hidden xl:table-cell">
                        <span className="text-xs font-mono text-navy-300">{device?.device_uid || '—'}</span>
                      </td>
                      <td className="py-3 px-2">
                        <Badge color={STATUS_COLORS[inc.status]}>{STATUS_LABELS[inc.status]}</Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant={inc.status === 'RESOLVED' ? 'ghost' : 'danger'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/responder/incidents/${inc.id}`);
                          }}
                        >
                          View <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={resolvedOnly ? CheckCircle2 : Siren}
              title={resolvedOnly ? 'No resolved incidents' : 'No active incidents'}
              description={resolvedOnly ? 'Resolved incidents will appear here.' : 'When a user triggers an emergency, it will appear here instantly.'}
            />
          </Card>
        )}
      </div>
    </ResponderSidebarLayout>
  );
}
