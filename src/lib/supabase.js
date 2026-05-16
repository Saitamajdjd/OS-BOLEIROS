import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não configuradas:')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗')
  console.error('Configure as variáveis de ambiente na Vercel.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
)