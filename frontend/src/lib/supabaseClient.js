import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Key are required. Check your .env.local file.');
}

const fetchWithTimeout = (url, options = {}, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout);
    fetch(url, { ...options, cache: 'no-store' })
      .then((res) => { clearTimeout(timer); resolve(res); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    lock: async (name, acquireTimeout, fn) => fn(),
  },
  global: { fetch: (url, options) => fetchWithTimeout(url, options, 30000) },
});

export const PROOF_FILES_BUCKET = 'proof-files';
export const getPublicUrl = (bucket, filePath) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
