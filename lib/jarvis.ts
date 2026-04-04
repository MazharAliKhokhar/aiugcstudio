/**
 * lib/jarvis.ts
 * Manages the Jarvislabs.ai GPU instance lifecycle.
 * Handles resume, pause, status polling, and heartbeat checks.
 * Used by the generate and stitch APIs to enable smart "pay-only-when-rendering" billing.
 */

const JARVIS_API_BASE = 'https://api.jarvislabs.ai/v1'
const POLL_INTERVAL_MS = 10_000 // 10 seconds between status checks
const HEARTBEAT_TIMEOUT_MS = 3_000

export interface JarvisInstance {
  instance_id: number
  status: 'Running' | 'Paused' | 'Creating' | 'Deleting'
  url: string
  ip: string
}

/** Read and validate the Jarvislabs API key from environment */
function getApiKey(): string {
  const key = process.env.JARVISLABS_API_KEY
  if (!key) throw new Error('JARVISLABS_API_KEY is not configured')
  return key
}

/** Build standard Jarvislabs auth headers */
function authHeaders() {
  return { 'X-API-KEY': getApiKey(), 'Content-Type': 'application/json' }
}

/** Generic Jarvislabs instance action: resume | pause */
async function instanceAction(instanceId: string | number, action: 'resume' | 'pause') {
  const res = await fetch(
    `${JARVIS_API_BASE}/instances/${instanceId}?action=${action}`,
    { method: 'PUT', headers: authHeaders() }
  )
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`Jarvis ${action} failed: ${msg || res.statusText}`)
  }
  return res.json()
}

export const jarvis = {
  /** Resume a paused Jarvislabs instance */
  resume: (id: string | number) => instanceAction(id, 'resume'),

  /** Pause a running Jarvislabs instance to stop billing */
  pause: (id: string | number) => instanceAction(id, 'pause'),

  /** Fetch instance metadata from the Jarvislabs API */
  async getStatus(instanceId: string | number): Promise<JarvisInstance> {
    const res = await fetch(`${JARVIS_API_BASE}/instances`, { headers: authHeaders() })
    if (!res.ok) throw new Error(`Failed to fetch Jarvis instances: ${res.statusText}`)
    const instances: JarvisInstance[] = await res.json()
    const target = instances.find(i => i.instance_id.toString() === instanceId.toString())
    if (!target) throw new Error(`Instance ${instanceId} not found in account`)
    return target
  },

  /**
   * Waits until the instance is Running AND its FastAPI server is responding.
   * Automatically sends a resume command if the instance is found to be Paused.
   * @param instanceId - The Jarvislabs instance ID
   * @param maxAttempts - Max polling attempts (default 20 = ~3.5 minutes)
   */
  async waitForReady(instanceId: string | number, maxAttempts = 20): Promise<string> {
    const jarvisUrl = process.env.NEXT_PUBLIC_JARVIS_API_URL
    if (!jarvisUrl) throw new Error('NEXT_PUBLIC_JARVIS_API_URL is not configured')

    for (let i = 0; i < maxAttempts; i++) {
      const instance = await this.getStatus(instanceId)

      if (instance.status === 'Running') {
        // Confirm the FastAPI server is actually responding
        try {
          const hb = await fetch(`${jarvisUrl}/health`, {
            signal: AbortSignal.timeout(HEARTBEAT_TIMEOUT_MS)
          })
          if (hb.ok) {
            console.log(`[Jarvis] GPU ready after ${i + 1} attempt(s).`)
            return jarvisUrl
          }
        } catch {
          // Server booting — wait and retry
        }
      } else if (instance.status === 'Paused') {
        if (i === 0) {
          // Only send resume once on first detection of paused state
          console.log('[Jarvis] Instance is Paused. Resuming...')
          await this.resume(instanceId)
        }
      }

      console.log(`[Jarvis] Waiting (${i + 1}/${maxAttempts}) — status: ${instance.status}`)
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
    }

    throw new Error('Jarvis GPU failed to become ready within the timeout period.')
  }
}
