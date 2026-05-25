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

export async function PUT(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const allowed = [
      'min_deposit', 'min_withdrawal',
      'coaching_fee', 'coaching_link', 'coaching_description',
      'chat_enabled', 'maintenance_mode',
      'kyc_fee', 'kyc_fee_address', 'kyc_fee_reason'
    ]

    const updates = {}
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key]
    }

    const { data: existing } = await supabaseAdmin
      .from('settings')
      .select('id')
      .limit(1)
      .single()

    if (existing) {
      await supabaseAdmin
        .from('settings')
        .update(updates)
        .eq('id', existing.id)
    } else {
      await supabaseAdmin
        .from('settings')
        .insert(updates)
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}