import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // Find latest pending deposit with a payment_id
    const { data: deposit } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .not('payment_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return Response.json({ deposit: deposit || null })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}