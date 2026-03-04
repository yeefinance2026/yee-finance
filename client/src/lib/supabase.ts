import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://qvlutxudysjjiinsikqj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bHV0eHVkeXNqamlpbnNpa3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4OTQ2MzQsImV4cCI6MjA4NzQ3MDYzNH0.TT-tk7vVuTVM8UYwdj7HmajItTHpXGj3vGYmywY2sfs"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)