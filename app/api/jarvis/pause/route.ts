import { NextRequest, NextResponse } from 'next/server'
import { jarvis } from '@/lib/jarvis'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const instanceIdOrName = process.env.JARVISLABS_INSTANCE_NAME || process.env.JARVISLABS_INSTANCE_ID
    if (!instanceIdOrName) throw new Error('Jarvis instance not configured')

    await jarvis.safePause(instanceIdOrName)
    return NextResponse.json({ success: true, message: 'GPU Paused' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
