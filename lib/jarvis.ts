/**
 * lib/jarvis.ts
 * Manages the Jarvislabs.ai GPU instance lifecycle.
 */

// We use the India production backend for IN1 region where the user's GPU is located.
const JARVIS_API_BASE = 'https://backendprod.jarvislabs.net'
const POLL_INTERVAL_MS = 20000 // 20s

interface JarvisInstance {
  instance_id: string | number
  status: 'Running' | 'Paused' | 'Booting' | string
  url: string | null
  name?: string
  instance_name?: string
}

function getApiKey(): string {
  const key = process.env.JARVISLABS_API_KEY?.trim()
  if (!key) throw new Error('JARVISLABS_API_KEY is not configured')
  return key
}

function authHeaders() {
  const key = getApiKey()
  return { 
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json' 
  }
}

/** Basic retry wrapper for fetches */
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  let lastError: any = null
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[Jarvis] Fetching: ${url} (Attempt ${i + 1}/${retries})`)
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(25000) })
      if (res.ok || i === retries - 1) return res
      
      const errBody = await res.text().catch(() => 'No body')
      console.warn(`[Jarvis] Fetch retry ${i + 1}/${retries} - Status: ${res.status} Body: ${errBody}`)
    } catch (err: any) {
      lastError = err
      if (i === retries - 1) break
      console.warn(`[Jarvis] Fetch failed, retrying (${i + 1}/${retries})...`, err.message || err)
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw new Error(`Jarvis Network Failure: ${lastError?.message || 'Unknown error'} after ${retries} attempts to ${url}`)
}

async function instanceAction(instanceId: string | number, action: 'resume' | 'pause') {
  console.log(`[Jarvis] Performing '${action}' on instance ${instanceId}...`)
  const path = action === 'resume' ? '/misc/resume' : '/misc/pause'
  
  // Official Jarvislabs backend expects machine_id
  const res = await fetchWithRetry(`${JARVIS_API_BASE}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ machine_id: instanceId.toString() })
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Failed to ${action} instance ${instanceId}: ${res.status} ${detail}`)
  }
  return true
}

export const jarvis = {
  async resume(instanceId: string | number) {
    return instanceAction(instanceId, 'resume')
  },

  async pause(instanceId: string | number) {
    return instanceAction(instanceId, 'pause')
  },

  async getStatus(instanceIdOrName: string | number): Promise<JarvisInstance> {
    try {
      // New SDK uses /instances/ with trailing slash
      const res = await fetchWithRetry(`${JARVIS_API_BASE}/instances/`, { headers: authHeaders() })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Failed to fetch Jarvis instances: ${res.status} ${errText}`)
      }
      const instances: JarvisInstance[] = await res.json()
      
      // Try finding by ID first
      let target = instances.find(i => i.instance_id.toString() === instanceIdOrName.toString())
      
      // If not found by ID, try finding by Name (case-insensitive)
      if (!target) {
        target = instances.find(i => 
          i.name?.toLowerCase() === instanceIdOrName.toString().toLowerCase() ||
          i.instance_name?.toLowerCase() === instanceIdOrName.toString().toLowerCase()
        )
      }

      if (!target) throw new Error(`Instance/Machine '${instanceIdOrName}' not found in your Jarvislabs account.`)
      return target
    } catch (err: any) {
      console.error('[Jarvis] getStatus failed:', err.message)
      throw new Error(`Connection to Jarvislabs failed: ${err.message}`)
    }
  },

  /**
   * Resolves the current proxy URL for a given instance ID or name by querying the API.
   */
  async getResolvedUrl(instanceIdOrName: string | number): Promise<string> {
    const instance = await this.getStatus(instanceIdOrName)
    if (!instance.url) {
      const fallback = process.env.NEXT_PUBLIC_JARVIS_API_URL?.trim()
      if (!fallback) throw new Error(`Instance ${instanceIdOrName} has no URL and no fallback is configured.`)
      return fallback
    }
    return instance.url.endsWith('/') ? instance.url.slice(0, -1) : instance.url
  },

  /**
   * Waits until the instance is Running AND its FastAPI server is responding.
   */
  async waitForReady(instanceIdOrName: string | number, maxAttempts = 20): Promise<string> {
    console.log(`[Jarvis] Waiting for GPU instance '${instanceIdOrName}' to be ready...`)
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const instance = await this.getStatus(instanceIdOrName)
        
        if (instance.status === 'Paused') {
          console.log(`[Jarvis] Instance ${instance.instance_id} ('${instanceIdOrName}') is Paused. Resuming...`)
          await this.resume(instance.instance_id)
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
        console.warn(`[Jarvis] Polling attempt ${i + 1} encountered an error:`, err.message || err)
      }

      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
    }
    throw new Error(`Jarvis GPU '${instanceIdOrName}' failed to become ready within the timeout period.`)
  },

  /**
   * Verifies if the FastAPI server inside the instance is responding to requests.
   */
  async heartbeat(baseUrl: string): Promise<boolean> {
    const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    try {
      console.log(`[Jarvis] Checking heartbeat at ${cleanUrl}/health...`)
      const res = await fetch(`${cleanUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000), // Quick 5s check
      })
      return res.status === 200
    } catch (e) {
      console.warn(`[Jarvis] Heartbeat failed for ${cleanUrl}:`, e instanceof Error ? e.message : 'Unknown error')
      return false
    }
  }
}
