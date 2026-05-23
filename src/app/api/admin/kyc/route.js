import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: kyc } = await supabaseAdmin
      .from('kyc')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false })

    return Response.json({ kyc: kyc || [] })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { kyc_id, status, user_id } = await req.json()

    await supabaseAdmin
      .from('kyc')
      .update({ status })
      .eq('id', kyc_id)

    await supabaseAdmin
      .from('users')
      .update({ kyc_status: status })
      .eq('id', user_id)

    await supabaseAdmin.from('notifications').insert({
      user_id,
      title: `KYC ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your KYC verification has been ${status === 'approved' ? 'approved. You can now process withdrawals.' : 'rejected. Please contact support for more information.'}`,
      type: 'kyc'
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}