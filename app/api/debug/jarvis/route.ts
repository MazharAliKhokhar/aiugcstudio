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

    console.log('[Debug] Attempting to fetch instances from JarvisLabs via /users/fetch...')
    
    // 2. Try fetching all instances
    const startTime = Date.now()
    const instances = await jarvis.getStatus(instanceName || instanceId || 'Unknown')
    const duration = Date.now() - startTime
    
    // Deep Scan of all possible endpoints
    const candidates = [
       ...(instances.endpoints || []),
       instances.url?.split('/lab')[0] || ''
    ].filter(Boolean)

    const scanResults = await Promise.all(candidates.map(async (baseUrl) => {
      const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
      const headers: Record<string, string> = apiKey ? { 'Authorization': `Token ${apiKey}` } : {}
      
      try {
        const res = await fetch(`${cleanUrl}/health`, { 
          method: 'GET', 
          headers,
          signal: AbortSignal.timeout(3000) 
        })
        return {
          url: cleanUrl,
          path: '/health',
          status: res.status,
          contentType: res.headers.get('content-type') || 'unknown',
          ok: res.ok && !(res.headers.get('content-type') || '').includes('text/html')
        }
      } catch (e: any) {
        return { url: cleanUrl, error: e.message }
      }
    }))

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      env: {
        instance_name: instanceName,
        apiKeySet: !!apiKey
      },
      match: {
        id: instances.machine_id || instances.instance_id || (instances as any).id,
        status: instances.status,
        name: instances.name || instances.instance_name
      },
      scan: scanResults,
      raw: instances 
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
