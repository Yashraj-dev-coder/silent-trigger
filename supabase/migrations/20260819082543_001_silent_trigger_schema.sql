/*
# Silent Trigger — Core Schema

## Overview
Creates the full data model for the Silent Trigger emergency response platform:
profiles (role extension of auth.users), devices, emergency incidents,
incident locations, emergency contacts, incident media (simulated audio/video),
notifications, and activity logs (timeline).

## New Tables
1. `profiles` — extends auth.users with name, phone, role (USER/RESPONDER/ADMIN).
2. `devices` — simulated Silent Trigger hardware units owned by a user.
3. `emergency_incidents` — the core incident record with status state machine.
4. `incident_locations` — simulated GPS points per incident.
5. `emergency_contacts` — user-managed emergency contacts (CRUD).
6. `incident_media` — simulated AUDIO/VIDEO stream records per incident.
7. `notifications` — in-app simulated notifications.
8. `activity_logs` — timeline events per incident.

## Security
- RLS enabled on every table.
- Users can read/write their own profile, devices, contacts, and their own incidents.
- Responders/admins can read ALL incidents, locations, media, notifications, activity logs,
  and can update incident status (acknowledge/respond/resolve).
- Owner columns default to auth.uid() so client inserts succeed without passing user_id.
- A helper function `is_responder()` checks the caller's profile role.

## Notes
1. All hardware-originated data (location, audio, video, device status) is SIMULATED.
2. Incident status state machine enforced at the application layer (TRIGGERED ->
   ALERT_GENERATED -> ACKNOWLEDGED -> RESPONDING -> RESOLVED).
*/

-- profiles (created first so is_responder() can reference it)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'USER',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('RESPONDER','ADMIN')));

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Helper: is the current user a responder or admin?
CREATE OR REPLACE FUNCTION is_responder()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('RESPONDER','ADMIN')
  );
$$;

-- devices
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_uid text NOT NULL UNIQUE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Silent Trigger',
  status text NOT NULL DEFAULT 'ONLINE',
  battery int NOT NULL DEFAULT 87,
  network_status text NOT NULL DEFAULT 'CONNECTED',
  gps_status text NOT NULL DEFAULT 'READY',
  camera_status text NOT NULL DEFAULT 'READY',
  microphone_status text NOT NULL DEFAULT 'READY',
  firmware_version text NOT NULL DEFAULT '1.0.0',
  last_connected timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_devices" ON devices;
CREATE POLICY "select_devices" ON devices FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_responder());

DROP POLICY IF EXISTS "insert_devices" ON devices;
CREATE POLICY "insert_devices" ON devices FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_devices" ON devices;
CREATE POLICY "update_devices" ON devices FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_devices" ON devices;
CREATE POLICY "delete_devices" ON devices FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- emergency_incidents
CREATE TABLE IF NOT EXISTS emergency_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_code text NOT NULL UNIQUE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  device_id uuid REFERENCES devices(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'TRIGGERED',
  priority text NOT NULL DEFAULT 'CRITICAL',
  risk_level text NOT NULL DEFAULT 'CRITICAL',
  risk_confidence numeric NOT NULL DEFAULT 0.95,
  risk_reason text NOT NULL DEFAULT 'Manual emergency trigger activated',
  activated_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE emergency_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_incidents" ON emergency_incidents;
CREATE POLICY "select_incidents" ON emergency_incidents FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_responder());

DROP POLICY IF EXISTS "insert_incidents" ON emergency_incidents;
CREATE POLICY "insert_incidents" ON emergency_incidents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_incidents" ON emergency_incidents;
CREATE POLICY "update_incidents" ON emergency_incidents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR is_responder()) WITH CHECK (auth.uid() = user_id OR is_responder());

DROP POLICY IF EXISTS "delete_incidents" ON emergency_incidents;
CREATE POLICY "delete_incidents" ON emergency_incidents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- incident_locations (simulated GPS)
CREATE TABLE IF NOT EXISTS incident_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES emergency_incidents(id) ON DELETE CASCADE,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy double precision NOT NULL DEFAULT 15,
  timestamp timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE incident_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_locations" ON incident_locations;
CREATE POLICY "select_locations" ON incident_locations FOR SELECT
  TO authenticated USING (
    auth.uid() = (SELECT user_id FROM emergency_incidents WHERE emergency_incidents.id = incident_locations.incident_id)
    OR is_responder()
  );

DROP POLICY IF EXISTS "insert_locations" ON incident_locations;
CREATE POLICY "insert_locations" ON incident_locations FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = (SELECT user_id FROM emergency_incidents WHERE emergency_incidents.id = incident_locations.incident_id)
    OR is_responder()
  );

-- emergency_contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text NOT NULL DEFAULT '',
  phone text NOT NULL,
  priority int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_contacts" ON emergency_contacts;
CREATE POLICY "select_contacts" ON emergency_contacts FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_responder());

DROP POLICY IF EXISTS "insert_contacts" ON emergency_contacts;
CREATE POLICY "insert_contacts" ON emergency_contacts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_contacts" ON emergency_contacts;
CREATE POLICY "update_contacts" ON emergency_contacts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_contacts" ON emergency_contacts;
CREATE POLICY "delete_contacts" ON emergency_contacts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- incident_media (simulated audio/video)
CREATE TABLE IF NOT EXISTS incident_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES emergency_incidents(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  source text NOT NULL DEFAULT 'SIMULATED',
  timestamp timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE incident_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_media" ON incident_media;
CREATE POLICY "select_media" ON incident_media FOR SELECT
  TO authenticated USING (
    auth.uid() = (SELECT user_id FROM emergency_incidents WHERE emergency_incidents.id = incident_media.incident_id)
    OR is_responder()
  );

DROP POLICY IF EXISTS "insert_media" ON incident_media;
CREATE POLICY "insert_media" ON incident_media FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = (SELECT user_id FROM emergency_incidents WHERE emergency_incidents.id = incident_media.incident_id)
    OR is_responder()
  );

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES emergency_incidents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'EMERGENCY',
  status text NOT NULL DEFAULT 'UNREAD',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_notifications" ON notifications;
CREATE POLICY "select_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_responder());

DROP POLICY IF EXISTS "insert_notifications" ON notifications;
CREATE POLICY "insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR is_responder());

DROP POLICY IF EXISTS "update_notifications" ON notifications;
CREATE POLICY "update_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR is_responder()) WITH CHECK (auth.uid() = user_id OR is_responder());

-- activity_logs (timeline)
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES emergency_incidents(id) ON DELETE CASCADE,
  event text NOT NULL,
  description text NOT NULL DEFAULT '',
  timestamp timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_activity_logs" ON activity_logs;
CREATE POLICY "select_activity_logs" ON activity_logs FOR SELECT
  TO authenticated USING (
    auth.uid() = (SELECT user_id FROM emergency_incidents WHERE emergency_incidents.id = activity_logs.incident_id)
    OR is_responder()
  );

DROP POLICY IF EXISTS "insert_activity_logs" ON activity_logs;
CREATE POLICY "insert_activity_logs" ON activity_logs FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = (SELECT user_id FROM emergency_incidents WHERE emergency_incidents.id = activity_logs.incident_id)
    OR is_responder()
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_user ON emergency_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON emergency_incidents(status);
CREATE INDEX IF NOT EXISTS idx_locations_incident ON incident_locations(incident_id);
CREATE INDEX IF NOT EXISTS idx_media_incident ON incident_media(incident_id);
CREATE INDEX IF NOT EXISTS idx_logs_incident ON activity_logs(incident_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
