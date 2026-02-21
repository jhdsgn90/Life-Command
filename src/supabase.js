import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnxwcsloxlxyjufhbpjg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRueHdjc2xveGx4eWp1ZmhicGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODAyMzQsImV4cCI6MjA4NzI1NjIzNH0.l70qU5XTLLTstdP5UVmOdJWQYYZ1dJzT6SY20RzE7ao';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
