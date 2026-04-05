import { NextRequest, NextResponse } from 'next/server'

/**
 * app/api/debug/jarvis/route.ts
 * A diagnostic endpoint to verify JarvisLabs connection in production.
 */
export async function GET(req: NextRequest) {
  try {
    const { jarvis } = await import('@/lib/jarvis')
    
    // 1. Check Env Vars (obscured)
    const apiKey = process.env.JARVISLABS_API_KEY
    const instanceName = process.env.JARVISLABS_INSTANCE_NAME
    const instanceId = process.env.JARVISLABS_INSTANCE_ID
    
    if (!apiKey) throw new Error('JARVISLABS_API_KEY is missing')

    console.log('[Debug] Attempting to fetch instances from JarvisLabs API...')
    
    // 2. Try fetching all instances
    const startTime = Date.now()
    const instances = await jarvis.getStatus(instanceName || instanceId || 'Unknown')
    const duration = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      env: {
        has_api_key: !!apiKey,
        key_preview: `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)}`,
        instance_name: instanceName || 'not set',
        instance_id: instanceId || 'not set'
      },
      match: {
        id: instances.instance_id,
        status: instances.status,
        url: instances.url || 'not set',
        name: (instances as any).name || (instances as any).instance_name || 'unnamed'
      }
    })

  } catch (err: any) {
    console.error('[Debug] Jarvis Diagnostic Failed:', err.message)
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      env_check: {
        has_api_key: !!process.env.JARVISLABS_API_KEY,
        instance_name: process.env.JARVISLABS_INSTANCE_NAME || 'not set'
      }
    }, { status: 500 })
  }
}
