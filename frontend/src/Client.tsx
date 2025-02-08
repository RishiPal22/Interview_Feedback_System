
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ezxqwbvzmieuieumdkca.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6eHF3YnZ6bWlldWlldW1ka2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MTg2ODMsImV4cCI6MjA1NDQ5NDY4M30.tIdCXeI-uqb7MIDQbjobEtG1msakbWyTczcJTHFReJ8'
export const supabase = createClient(supabaseUrl, supabaseKey)