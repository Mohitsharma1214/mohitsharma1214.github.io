import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://zxovekhtcajtefedkkee.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_JxI18d2ketnFvFZ6Yn0Beg_yXpmd7uJ';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

// Resilient fetch wrapper with a 3.5s timeout:
// If Supabase is paused, down, or blocked by ISP/DNS, it aborts quickly
// so the portfolio instantly falls back to its full local dataset without hanging!
const timeoutFetch: typeof fetch = (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  // Combine caller signal with timeout signal if provided
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
  });
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: timeoutFetch,
      },
    })
  : null;
