/**
 * lib/jarvis.ts
 * Manages the Jarvislabs.ai GPU instance lifecycle.
 */

const JARVIS_API_BASE = 'https://api.jarvislabs.ai/v1'
const POLL_INTERVAL_MS = 10_000
const HEARTBEAT_TIMEOUT_MS = 5_000

export interface JarvisInstance {
  instance_id: number
  status: 'Running' | 'Paused' | 'Creating' | 'Deleting'
  url: string
  ip: string
}

function getApiKey(): string {
  const key = process.env.JARVISLABS_API_KEY?.trim()
  if (!key) throw new Error('JARVISLABS_API_KEY is not configured')
  return key
}

function authHeaders() {
  return { 'X-API-KEY': getApiKey(), 'Content-Type': 'application/json' }
}

/** Basic retry wrapper for fetches */
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) })
      if (res.ok || i === retries - 1) return res
      console.warn(`[Jarvis] Fetch retry ${i + 1}/${retries} for ${url} - Status: ${res.status}`)
    } catch (err: any) {
      if (i === retries - 1) throw err
      console.warn(`[Jarvis] Fetch failed, retrying (${i + 1}/${retries})...`, err.message)
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw new Error('Fetch failed after retries')
}

async function instanceAction(instanceId: string | number, action: 'resume' | 'pause') {
  try {
    const res = await fetchWithRetry(
      `${JARVIS_API_BASE}/instances/${instanceId}?action=${action}`,
      { method: 'PUT', headers: authHeaders() }
    )
    if (!res.ok) {
      const msg = await res.text()
      throw new Error(`Jarvis API Error (${res.status}): ${msg || res.statusText}`)
    }
    return res.json()
  } catch (err: any) {
    console.error(`[Jarvis] Instance ${action} error:`, err.message)
    throw new Error(`Network failure during ${action}: ${err.message}`)
  }
}

export const jarvis = {
  resume: (id: string | number) => instanceAction(id, 'resume'),
  pause: (id: string | number) => instanceAction(id, 'pause'),

  async heartbeat(url: string): Promise<boolean> {
    if (!url) return false
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url
    try {
      // We use a short timeout for heartbeat to avoid blocking
      const res = await fetch(`${cleanUrl}/health`, {
        signal: AbortSignal.timeout(HEARTBEAT_TIMEOUT_MS)
      })
      return res.ok
    } catch (err: any) {
      // Silently log heartbeat failures as they are expected during boot
      console.log(`[Jarvis] Heartbeat failed for ${cleanUrl}: ${err.message}`)
      return false
    }
  },

  async getStatus(instanceId: string | number): Promise<JarvisInstance> {
    try {
      const res = await fetchWithRetry(`${JARVIS_API_BASE}/instances`, { headers: authHeaders() })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Failed to fetch Jarvis instances: ${res.status} ${errText}`)
      }
      const instances: JarvisInstance[] = await res.json()
      const target = instances.find(i => i.instance_id.toString() === instanceId.toString())
      if (!target) throw new Error(`Instance ${instanceId} not found in account.`)
      return target
    } catch (err: any) {
      console.error('[Jarvis] getStatus failed:', err.message)
      throw new Error(`Connection to Jarvislabs failed: ${err.message}`)
    }
  },

  /**
   * Resolves the current proxy URL for a given instance ID by querying the API.
   * This is more reliable than using a static environment variable.
   */
  async getResolvedUrl(instanceId: string | number): Promise<string> {
    const instance = await this.getStatus(instanceId)
    if (!instance.url) {
      // Fallback to env variable if API returns empty URL (rare)
      const fallback = process.env.NEXT_PUBLIC_JARVIS_API_URL?.trim()
      if (!fallback) throw new Error(`Instance ${instanceId} has no URL and no fallback is configured.`)
      return fallback
    }
    // Jarvis API returns URLs like "https://XXXX.proxy.jarvislabs.net"
    return instance.url.endsWith('/') ? instance.url.slice(0, -1) : instance.url
  },

  /**
   * Waits until the instance is Running AND its FastAPI server is responding.
   * Dynamically resolves the URL to handle cases where the proxy ID has changed.
   */
  async waitForReady(instanceId: string | number, maxAttempts = 20): Promise<string> {
    console.log(`[Jarvis] Waiting for GPU instance ${instanceId} to be ready...`)
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const instance = await this.getStatus(instanceId)
        
        if (instance.status === 'Paused') {
          console.log('[Jarvis] Instance is Paused. Resuming...')
          await this.resume(instanceId)
        } else if (instance.status === 'Running') {
          const currentUrl = instance.url || process.env.NEXT_PUBLIC_JARVIS_API_URL
          if (currentUrl) {
            const isHealthy = await this.heartbeat(currentUrl)
            if (isHealthy) {
              console.log(`[Jarvis] GPU ready at ${currentUrl}`)
              return currentUrl
            }
          }
        }
        
        console.log(`[Jarvis] Status: ${instance.status}. Polling attempt ${i + 1}/${maxAttempts}...`)
      } catch (err: any) {
        console.warn(`[Jarvis] Polling attempt ${i + 1} encountered an error:`, err.message)
      }

      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
    }
    throw new Error('Jarvis GPU failed to become ready within the timeout period.')
  }
}
