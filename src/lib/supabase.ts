import { createClient } from '@supabase/supabase-js';

const rawUrl = https://sitpnuzvdsnsdwyelkqk.supabase.co
const supabaseAnonKey = sb_publishable_cd-ReE5sOgUyxJLWP87AgA_rBUa3T8A

// Trailing slash (/) aur space ko automatically saaf karne ke liye:
const supabaseUrl = rawUrl.trim().replace(/\/+$/, '');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
