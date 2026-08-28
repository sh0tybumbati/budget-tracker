import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// LocalStorage keys for optional user-configured Supabase credentials
const STORAGE_URL_KEY = 'budget_tracker_supabase_url';
const STORAGE_ANON_KEY = 'budget_tracker_supabase_anon_key';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ANON_KEY) || '' : '';

  return {
    url: localUrl || envUrl,
    anonKey: localKey || envKey,
  };
}

export function setCustomSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url) {
      localStorage.setItem(STORAGE_URL_KEY, url.trim());
    } else {
      localStorage.removeItem(STORAGE_URL_KEY);
    }
    if (anonKey) {
      localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(STORAGE_ANON_KEY);
    }
  }
  supabaseInstance = null; // Reset instance to recreate with new credentials
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) {
    return null;
  }

  try {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

export interface BudgetPayload {
  entries: any[];
  periodType?: string;
  timelineCheckedEntries?: Record<string, boolean>;
  version?: string;
  lastUpdated?: string;
}

export async function fetchUserBudgetData(): Promise<BudgetPayload | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;

  const { data, error } = await client
    .from('budget_data')
    .select('data, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching budget data from Supabase:', error);
    throw error;
  }

  if (!data) return null;

  const parsedData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
  return {
    ...parsedData,
    lastUpdated: data.updated_at,
  };
}

export async function saveUserBudgetData(payload: BudgetPayload): Promise<string> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not configured.');

  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error('User is not logged in.');

  const now = new Date().toISOString();
  const dataToSave = {
    user_id: user.id,
    data: {
      entries: payload.entries || [],
      periodType: payload.periodType || 'semimonthly',
      timelineCheckedEntries: payload.timelineCheckedEntries || {},
      version: payload.version || '1.0',
    },
    updated_at: now,
  };

  const { error } = await client
    .from('budget_data')
    .upsert(dataToSave, { onConflict: 'user_id' });

  if (error) {
    console.error('Error saving budget data to Supabase:', error);
    throw error;
  }

  return now;
}

export type AuthMode = 'signin' | 'signup';
