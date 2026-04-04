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
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) })
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
    throw new Error(`Network failure during ${action}: ${err.message}. Check your API Key and Link.`)
  }
}

export const jarvis = {
  resume: (id: string | number) => instanceAction(id, 'resume'),
  pause: (id: string | number) => instanceAction(id, 'pause'),

  async heartbeat(url: string): Promise<boolean> {
    if (!url) return false
    try {
      const res = await fetch(`${url}/health`, {
        signal: AbortSignal.timeout(HEARTBEAT_TIMEOUT_MS)
      })
      return res.ok
    } catch (err: any) {
      console.log(`[Jarvis] Heartbeat failed for ${url}:`, err.message)
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
      if (!target) throw new Error(`Instance ${instanceId} not found in account. Verify your Instance ID.`)
      return target
    } catch (err: any) {
      console.error('[Jarvis] getStatus failed:', err.message)
      if (err.cause) console.error('[Jarvis] Cause:', err.cause)
      throw new Error(`Connection to Jarvislabs failed: ${err.message}`)
    }
  }
}
