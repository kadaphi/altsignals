import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: kyc } = await supabaseAdmin
      .from('kyc')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return Response.json({ kyc: kyc || null })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { document_type, document_number, document_url, selfie_url } = await req.json()

    if (!document_type || !document_number) {
      return Response.json({ error: 'Document type and number are required' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('kyc')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      await supabaseAdmin
        .from('kyc')
        .update({ document_type, document_number, document_url, selfie_url, status: 'pending' })
        .eq('user_id', user.id)
    } else {
      await supabaseAdmin.from('kyc').insert({
        user_id: user.id,
        document_type,
        document_number,
        document_url,
        selfie_url,
        status: 'pending'
      })
    }

    await supabaseAdmin
      .from('users')
      .update({ kyc_status: 'pending' })
      .eq('id', user.id)

    if (process.env.PUSHOVER_API_TOKEN) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_API_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: '📋 New KYC Submission',
          message: `${user.full_name} submitted KYC documents`,
          priority: 0
        })
      })
    }

    return Response.json({ success: true, message: 'KYC submitted successfully' })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}