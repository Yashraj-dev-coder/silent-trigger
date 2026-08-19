import type { IncidentStatus, Priority, DeviceStatus } from './types';

export const DEMO_COORDINATES = {
  latitude: 12.9716,
  longitude: 77.5946,
  accuracy: 15,
};

export const DEMO_ACCOUNTS = {
  user: {
    email: 'demo@silenttrigger.local',
    password: 'SilentTrigger!Demo2024',
    name: 'Demo User',
    phone: '+91 98765 43210',
    role: 'USER' as const,
  },
  responder: {
    email: 'responder@silenttrigger.local',
    password: 'SilentTrigger!Responder2024',
    name: 'Emergency Responder',
    phone: '+91 98765 11111',
    role: 'RESPONDER' as const,
  },
};

export const INCIDENT_STATUS_FLOW: IncidentStatus[] = [
  'TRIGGERED',
  'ALERT_GENERATED',
  'ACKNOWLEDGED',
  'RESPONDING',
  'RESOLVED',
];

export const STATUS_COLORS: Record<IncidentStatus, string> = {
  TRIGGERED: 'bg-emergency-500/20 text-emergency-400 border-emergency-500/40',
  ALERT_GENERATED: 'bg-emergency-500/20 text-emergency-400 border-emergency-500/40',
  ACKNOWLEDGED: 'bg-warning-500/20 text-warning-400 border-warning-500/40',
  RESPONDING: 'bg-info-500/20 text-info-400 border-info-500/40',
  RESOLVED: 'bg-success-500/20 text-success-400 border-success-500/40',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  CRITICAL: 'bg-emergency-500/20 text-emergency-400 border-emergency-500/40',
  HIGH: 'bg-warning-500/20 text-warning-400 border-warning-500/40',
  MEDIUM: 'bg-info-500/20 text-info-400 border-info-500/40',
  LOW: 'bg-navy-500/20 text-navy-400 border-navy-500/40',
};

export const DEVICE_STATUS_COLORS: Record<string, string> = {
  ONLINE: 'bg-success-500/20 text-success-400 border-success-500/40',
  OFFLINE: 'bg-navy-500/20 text-navy-400 border-navy-500/40',
  MAINTENANCE: 'bg-warning-500/20 text-warning-400 border-warning-500/40',
  READY: 'bg-success-500/20 text-success-400 border-success-500/40',
  CONNECTED: 'bg-success-500/20 text-success-400 border-success-500/40',
  ACTIVE: 'bg-success-500/20 text-success-400 border-success-500/40',
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  TRIGGERED: 'Triggered',
  ALERT_GENERATED: 'Alert Generated',
  ACKNOWLEDGED: 'Acknowledged',
  RESPONDING: 'Responding',
  RESOLVED: 'Resolved',
};

export const VALID_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  TRIGGERED: ['ALERT_GENERATED', 'ACKNOWLEDGED', 'RESPONDING', 'RESOLVED'],
  ALERT_GENERATED: ['ACKNOWLEDGED', 'RESPONDING', 'RESOLVED'],
  ACKNOWLEDGED: ['RESPONDING', 'RESOLVED'],
  RESPONDING: ['RESOLVED'],
  RESOLVED: [],
};
