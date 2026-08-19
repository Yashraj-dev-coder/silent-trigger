import { supabase } from '@/lib/supabase';
import { DEMO_COORDINATES } from '@/lib/constants';
import { generateIncidentCode, jitterCoord } from '@/lib/utils';
import type { IncidentStatus, IncidentLocation, IncidentMedia, ActivityLog, Notification, RiskAnalysis, EmergencyIncident } from '@/lib/types';

export async function riskAnalysis(): Promise<RiskAnalysis> {
  return {
    riskLevel: 'CRITICAL',
    confidence: 0.95,
    reason: 'Manual emergency trigger activated',
  };
}

export interface TriggerResult {
  incident: EmergencyIncident;
  location: IncidentLocation;
  media: IncidentMedia[];
  logs: ActivityLog[];
  notifications: Notification[];
}

export async function triggerEmergency(userId: string, deviceId: string): Promise<{ data: TriggerResult | null; error: string | null }> {
  const risk = await riskAnalysis();
  const incidentCode = generateIncidentCode();
  const now = new Date();

  const { data: incident, error: incErr } = await supabase
    .from('emergency_incidents')
    .insert({
      incident_code: incidentCode,
      user_id: userId,
      device_id: deviceId,
      status: 'TRIGGERED',
      priority: risk.riskLevel,
      risk_level: risk.riskLevel,
      risk_confidence: risk.confidence,
      risk_reason: risk.reason,
      activated_at: now.toISOString(),
    })
    .select()
    .single();

  if (incErr || !incident) return { data: null, error: incErr?.message || 'Failed to create incident' };

  const incidentId = incident.id;
  const t0 = now;
  const times = [
    new Date(t0.getTime() + 1000),
    new Date(t0.getTime() + 2000),
    new Date(t0.getTime() + 3000),
    new Date(t0.getTime() + 3000),
    new Date(t0.getTime() + 4000),
  ];

  const { data: location } = await supabase
    .from('incident_locations')
    .insert({
      incident_id: incidentId,
      latitude: jitterCoord(DEMO_COORDINATES.latitude),
      longitude: jitterCoord(DEMO_COORDINATES.longitude),
      accuracy: DEMO_COORDINATES.accuracy,
      timestamp: times[1].toISOString(),
    })
    .select()
    .single();

  const { data: media } = await supabase
    .from('incident_media')
    .insert([
      { incident_id: incidentId, type: 'AUDIO', status: 'ACTIVE', source: 'SIMULATED', timestamp: times[2].toISOString() },
      { incident_id: incidentId, type: 'VIDEO', status: 'ACTIVE', source: 'SIMULATED', timestamp: times[3].toISOString() },
    ])
    .select();

  const { data: logs } = await supabase
    .from('activity_logs')
    .insert([
      { incident_id: incidentId, event: 'Silent Trigger Activated', description: 'Emergency trigger activated by device ST-001', timestamp: t0.toISOString() },
      { incident_id: incidentId, event: 'Emergency Event Received', description: 'Backend received emergency signal', timestamp: times[0].toISOString() },
      { incident_id: incidentId, event: 'Location Captured', description: `Simulated GPS: ${location?.latitude.toFixed(4)}, ${location?.longitude.toFixed(4)}`, timestamp: times[1].toISOString() },
      { incident_id: incidentId, event: 'Audio Stream Activated', description: 'Simulated audio recording started', timestamp: times[2].toISOString() },
      { incident_id: incidentId, event: 'Video Stream Activated', description: 'Simulated video feed started', timestamp: times[3].toISOString() },
      { incident_id: incidentId, event: 'Emergency Alert Generated', description: 'Risk analysis: CRITICAL (95% confidence)', timestamp: times[4].toISOString() },
    ])
    .select();

  const { data: notifs } = await supabase
    .from('notifications')
    .insert({
      incident_id: incidentId,
      user_id: userId,
      type: 'EMERGENCY',
      status: 'UNREAD',
      message: `New emergency incident ${incidentCode} — CRITICAL priority`,
    })
    .select();

  const { error: updateErr } = await supabase
    .from('emergency_incidents')
    .update({ status: 'ALERT_GENERATED' })
    .eq('id', incidentId);

  if (!updateErr) {
    incident.status = 'ALERT_GENERATED';
  }

  return {
    data: {
      incident,
      location: location as IncidentLocation,
      media: (media || []) as IncidentMedia[],
      logs: (logs || []) as ActivityLog[],
      notifications: (notifs || []) as Notification[],
    },
    error: null,
  };
}

const VALID_NEXT: Record<IncidentStatus, IncidentStatus[]> = {
  TRIGGERED: ['ALERT_GENERATED', 'ACKNOWLEDGED', 'RESPONDING', 'RESOLVED'],
  ALERT_GENERATED: ['ACKNOWLEDGED', 'RESPONDING', 'RESOLVED'],
  ACKNOWLEDGED: ['RESPONDING', 'RESOLVED'],
  RESPONDING: ['RESOLVED'],
  RESOLVED: [],
};

export function canTransition(from: IncidentStatus, to: IncidentStatus): boolean {
  return VALID_NEXT[from]?.includes(to) ?? false;
}

export async function updateIncidentStatus(
  incidentId: string,
  newStatus: IncidentStatus
): Promise<{ error: string | null }> {
  const { data: incident } = await supabase
    .from('emergency_incidents')
    .select('status, incident_code')
    .eq('id', incidentId)
    .maybeSingle();

  if (!incident) return { error: 'Incident not found' };

  const currentStatus = incident.status as IncidentStatus;
  if (!canTransition(currentStatus, newStatus)) {
    return { error: `Cannot transition from ${currentStatus} to ${newStatus}` };
  }

  const updates: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() };
  if (newStatus === 'ACKNOWLEDGED') updates.acknowledged_at = new Date().toISOString();
  if (newStatus === 'RESOLVED') updates.resolved_at = new Date().toISOString();

  const { error } = await supabase
    .from('emergency_incidents')
    .update(updates)
    .eq('id', incidentId);

  if (error) return { error: error.message };

  const eventMap: Record<IncidentStatus, string> = {
    TRIGGERED: 'Silent Trigger Activated',
    ALERT_GENERATED: 'Emergency Alert Generated',
    ACKNOWLEDGED: 'Responder Acknowledged',
    RESPONDING: 'Responder En Route',
    RESOLVED: 'Incident Resolved',
  };

  await supabase.from('activity_logs').insert({
    incident_id: incidentId,
    event: eventMap[newStatus],
    description: `Status changed: ${currentStatus} → ${newStatus}`,
    timestamp: new Date().toISOString(),
  });

  return { error: null };
}

export async function addLocationUpdate(incidentId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('incident_locations').insert({
    incident_id: incidentId,
    latitude: jitterCoord(DEMO_COORDINATES.latitude, 0.002),
    longitude: jitterCoord(DEMO_COORDINATES.longitude, 0.002),
    accuracy: 10 + Math.floor(Math.random() * 10),
    timestamp: new Date().toISOString(),
  });
  return { error: error?.message || null };
}

export async function resetDemoData(userId: string): Promise<{ error: string | null }> {
  const { error: delErr } = await supabase
    .from('emergency_incidents')
    .delete()
    .eq('user_id', userId)
    .neq('status', 'RESOLVED');

  return { error: delErr?.message || null };
}
