import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { invoice_id } = await req.json()

    const { data: deposit } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('invoice_id', invoice_id)
      .eq('user_id', user.id)
      .single()

    if (!deposit) return Response.json({ error: 'Deposit not found' }, { status: 404 })

    if (deposit.status === 'completed') {
      const { data: updatedUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      return Response.json({ success: true, status: 'completed', user: updatedUser })
    }

    return Response.json({ success: true, status: deposit.status })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}