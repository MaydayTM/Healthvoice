import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, HealthLog, UserStats, ExtractionResult } from '../types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// User settings operations (using hv_user_settings table)
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('hv_user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // If no settings exist yet, create them
    if (error.code === 'PGRST116') {
      return createProfile(userId);
    }
    console.error('Error fetching profile:', error);
    return null;
  }

  // Map to Profile type (user_id -> id)
  return {
    id: data.user_id,
    created_at: data.created_at,
    display_name: data.display_name,
    preferences: data.preferences,
  };
}

export async function createProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('hv_user_settings')
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) {
    // If profile already exists (duplicate key), fetch it instead
    if (error.code === '23505') {
      const { data: existingData } = await supabase
        .from('hv_user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingData) {
        return {
          id: existingData.user_id,
          created_at: existingData.created_at,
          display_name: existingData.display_name,
          preferences: existingData.preferences,
        };
      }
    }
    console.error('Error creating profile:', error);
    return null;
  }

  return {
    id: data.user_id,
    created_at: data.created_at,
    display_name: data.display_name,
    preferences: data.preferences,
  };
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  // Map Profile fields to hv_user_settings fields
  const dbUpdates: Record<string, unknown> = {};
  if (updates.display_name !== undefined) dbUpdates.display_name = updates.display_name;
  if (updates.preferences !== undefined) dbUpdates.preferences = updates.preferences;

  const { data, error } = await supabase
    .from('hv_user_settings')
    .update(dbUpdates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return {
    id: data.user_id,
    created_at: data.created_at,
    display_name: data.display_name,
    preferences: data.preferences,
  };
}

// Health log operations (using hv_health_logs table)
export async function getHealthLogs(
  userId: string,
  limit = 50,
  offset = 0
): Promise<HealthLog[]> {
  const { data, error } = await supabase
    .from('hv_health_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching health logs:', error);
    return [];
  }

  return data || [];
}

export async function getHealthLogsByDate(
  userId: string,
  startDate: string,
  endDate: string
): Promise<HealthLog[]> {
  const { data, error } = await supabase
    .from('hv_health_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', startDate)
    .lte('logged_at', endDate)
    .order('logged_at', { ascending: false });

  if (error) {
    console.error('Error fetching health logs by date:', error);
    return [];
  }

  return data || [];
}

export async function createHealthLog(
  log: Omit<HealthLog, 'id' | 'created_at'>
): Promise<HealthLog | null> {
  const { data, error } = await supabase
    .from('hv_health_logs')
    .insert(log)
    .select()
    .single();

  if (error) {
    console.error('Error creating health log:', error);
    return null;
  }

  return data;
}

export async function updateHealthLog(
  id: string,
  updates: Partial<HealthLog>
): Promise<HealthLog | null> {
  const { data, error } = await supabase
    .from('hv_health_logs')
    .update({ ...updates, was_edited: true })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating health log:', error);
    return null;
  }

  return data;
}

export async function deleteHealthLog(id: string): Promise<boolean> {
  const { error } = await supabase.from('hv_health_logs').delete().eq('id', id);

  if (error) {
    console.error('Error deleting health log:', error);
    return false;
  }

  return true;
}

// User stats operations (using hv_user_stats table)
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from('hv_user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user stats:', error);
    return null;
  }

  return data;
}

// Edge function call for parsing health logs
export async function parseHealthLog(
  transcript: string,
  clarification?: { field: string; answer: string }
): Promise<ExtractionResult> {
  const { data, error } = await supabase.functions.invoke('parse-health-log', {
    body: { transcript, clarification },
  });

  if (error) {
    console.error('Error parsing health log:', error);
    throw new Error('Failed to parse health log');
  }

  return data as ExtractionResult;
}

// Auth helpers
export async function signInAnonymously(): Promise<string | null> {
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error('Error signing in anonymously:', error);
    return null;
  }

  return data.user?.id || null;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
