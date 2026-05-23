import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: announcements } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5)

    return Response.json({ announcements: announcements || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}