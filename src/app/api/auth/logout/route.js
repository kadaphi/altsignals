import { getUserFromRequest } from '@/lib/auth'

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}