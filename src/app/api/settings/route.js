import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('*')
      .single()

    return Response.json({ settings: settings || {} })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}