export async function POST(req) {
  try {
    const { page, userAgent } = await req.json()

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'Unknown'
    const country = req.headers.get('x-vercel-ip-country') || 'Unknown'
    const city = req.headers.get('x-vercel-ip-city') || 'Unknown'

    if (process.env.PUSHOVER_API_TOKEN) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_API_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: '👁 New AltSignals Visitor',
          message: `Page: ${page}\nLocation: ${city}, ${country}\nIP: ${ip}`,
          priority: -1,
          sound: 'none'
        })
      })
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}