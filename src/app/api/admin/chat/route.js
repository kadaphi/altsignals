export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user?.is_admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const includeClosed = searchParams.get('include_closed') === 'true'

    let query = supabaseAdmin
      .from('chat_sessions')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false })

    if (!includeClosed) {
      query = query.neq('status', 'closed')
    }

    const { data: sessions } = await query

    const formatted = (sessions || []).map(s => ({
      ...s,
      display_name: s.users?.full_name || s.guest_name || 'Guest',
      display_email: s.users?.email || s.guest_email || 'No email'
    }))

    return Response.json({ sessions: formatted })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}