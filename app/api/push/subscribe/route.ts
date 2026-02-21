import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { endpoint, keys, deviceName, timezone } = body

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint,
        keys_p256dh: keys.p256dh,
        keys_auth: keys.auth,
        device_name: deviceName || null,
        timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,endpoint' }
    )
    .select()
    .single()

  if (error) {
    const { logServerError } = await import('@/lib/server-logger')
    logServerError('api/push/subscribe', 'Failed to save subscription', {
      supabaseError: error.message,
    }, user.id)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }

  return NextResponse.json({ subscription: data })
}
