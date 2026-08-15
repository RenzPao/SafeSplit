import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qacixehgybllwgkxudyi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhY2l4ZWhneWJsbHdna3h1ZHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDUyMzcsImV4cCI6MjEwMDM4MTIzN30.LVtFxzIWmLF6wj2_ZIyuCow4Xbb-hEnCU6QDURWu_vE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
