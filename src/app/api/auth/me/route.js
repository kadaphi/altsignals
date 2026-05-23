import { getUserFromRequest } from '@/lib/auth'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ user })
  } catch (error) {
    console.error('Me error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}