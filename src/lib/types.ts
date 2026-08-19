export type UserRole = 'USER' | 'RESPONDER' | 'ADMIN';

export type IncidentStatus =
  | 'TRIGGERED'
  | 'ALERT_GENERATED'
  | 'ACKNOWLEDGED'
  | 'RESPONDING'
  | 'RESOLVED';

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';

export type MediaType = 'AUDIO' | 'VIDEO';
export type MediaStatus = 'ACTIVE' | 'INACTIVE' | 'STOPPED';

export type NotificationStatus = 'UNREAD' | 'READ';

export interface Profile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  device_uid: string;
  user_id: string;
  name: string;
  status: DeviceStatus;
  battery: number;
  network_status: string;
  gps_status: string;
  camera_status: string;
  microphone_status: string;
  firmware_version: string;
  last_connected: string;
  created_at: string;
}

export interface EmergencyIncident {
  id: string;
  incident_code: string;
  user_id: string;
  device_id: string | null;
  status: IncidentStatus;
  priority: Priority;
  risk_level: string;
  risk_confidence: number;
  risk_reason: string;
  activated_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentLocation {
  id: string;
  incident_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
  created_at: string;
}

export interface IncidentMedia {
  id: string;
  incident_id: string;
  type: MediaType;
  status: MediaStatus;
  source: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  incident_id: string | null;
  user_id: string | null;
  type: string;
  status: NotificationStatus;
  message: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  incident_id: string;
  event: string;
  description: string;
  timestamp: string;
}

export interface IncidentWithDetails extends EmergencyIncident {
  profile?: Profile;
  device?: Device;
  locations?: IncidentLocation[];
  media?: IncidentMedia[];
  activity_logs?: ActivityLog[];
}

export interface RiskAnalysis {
  riskLevel: Priority;
  confidence: number;
  reason: string;
}
