import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/lib/types';
import { DEMO_ACCOUNTS } from '@/lib/constants';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function ensureProfile(userId: string, fallback: Partial<Profile> = {}): Promise<Profile | null> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (existing) return existing as Profile;

  const newProfile = {
    id: userId,
    name: fallback.name || '',
    phone: fallback.phone || '',
    role: fallback.role || ('USER' as UserRole),
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select()
    .maybeSingle();

  if (error) {
    return { ...newProfile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Profile;
  }
  return data as Profile;
}

async function ensureDemoDevice(userId: string) {
  const { data: existing } = await supabase
    .from('devices')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) return;

  await supabase.from('devices').insert({
    device_uid: 'ST-001',
    user_id: userId,
    name: 'Silent Trigger ST-001',
    status: 'ONLINE',
    battery: 87,
    network_status: 'CONNECTED',
    gps_status: 'READY',
    camera_status: 'READY',
    microphone_status: 'READY',
    firmware_version: '1.0.0',
  });
}

async function ensureDemoContacts(userId: string) {
  const { data: existing } = await supabase
    .from('emergency_contacts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) return;

  await supabase.from('emergency_contacts').insert([
    { user_id: userId, name: 'Priya Sharma', relationship: 'Sister', phone: '+91 98765 12345', priority: 1 },
    { user_id: userId, name: 'Rahul Verma', relationship: 'Friend', phone: '+91 98765 67890', priority: 2 },
  ]);
}

/**
 * Register a user via the auth-helper edge function, which uses the service
 * role key to auto-confirm the email (so login works immediately without
 * requiring the user to click a confirmation link).
 */
async function registerViaEdgeFunction(
  email: string,
  password: string,
  name: string,
  phone: string,
  role: UserRole = 'USER'
): Promise<{ error: string | null }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const apiUrl = `${supabaseUrl}/functions/v1/auth-helper/register`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
        Apikey: anonKey,
      },
      body: JSON.stringify({ email, password, name, phone, role }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'Registration failed' }));
      return { error: errData.error || `Registration failed (${response.status})` };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error during registration' };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const p = await ensureProfile(userId);
    setProfile(p);
    return p;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      await loadProfile(session.user.id);
    }
  }, [session, loadProfile]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user?.id) {
        loadProfile(data.session.user.id).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        if (newSession?.user?.id) {
          const p = await loadProfile(newSession.user.id);
          await ensureDemoDevice(newSession.user.id);
          if (p?.role === 'USER') {
            await ensureDemoContacts(newSession.user.id);
          }
        } else {
          setProfile(null);
        }
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, phone: string) => {
    // Use edge function to register with auto-confirmed email
    const { error } = await registerViaEdgeFunction(email, password, name, phone, 'USER');
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export async function seedDemoAccounts(): Promise<{ error: string | null }> {
  // Register both demo accounts via the edge function (auto-confirms email)
  for (const account of [DEMO_ACCOUNTS.user, DEMO_ACCOUNTS.responder]) {
    // First try to sign in — maybe the account already exists
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });

    if (signInError) {
      // Account doesn't exist or wrong password — register it
      const { error: regError } = await registerViaEdgeFunction(
        account.email,
        account.password,
        account.name,
        account.phone,
        account.role
      );
      if (regError) {
        // If registration fails (e.g., user already exists), try signing in again
        // in case the account exists but email wasn't confirmed before
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: account.email,
          password: account.password,
        });
        if (retryError) {
          return { error: `Failed to set up ${account.email}: ${regError}` };
        }
        await supabase.auth.signOut();
      } else {
        // Registration succeeded, sign out so we're clean
        await supabase.auth.signOut();
      }
    } else {
      // Account exists and login worked — sign out
      await supabase.auth.signOut();
    }
  }
  return { error: null };
}
