/**
 * lib/jarvis.ts
 * Manages the Jarvislabs.ai GPU instance lifecycle.
 */

/// India-01 region backend prod
const JARVIS_API_BASE = 'https://backendprod.jarvislabs.net'
const POLL_INTERVAL_MS = 20000 // 20s

interface JarvisInstance {
  id: string | number
  instance_id: string | number
  machine_id: string | number
  status: 'Running' | 'Paused' | 'Booting' | string
  url: string | null
  name?: string
  instance_name?: string
  template?: string
  framework?: string
  framework_id?: string | number
  gpu_type?: string
  num_gpu?: number
  endpoints?: string[]
  storage?: number
  is_high_disk?: boolean
  is_vm?: boolean
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

export const jarvis = {
  async resume(instance: JarvisInstance) {
    const template = instance.framework || instance.template || 'pytorch'
    const id = instance.instance_id
    console.log(`[Jarvis] Resuming instance ${id} (${template})...`)
    
    // SDK payload for resume
    const payload = {
      machine_id: id,
      instance_id: id,
      framework_id: (instance as any).framework_id,
      framework: template,
      image_format: (instance as any).image_format || 'pytorch',
      name: instance.name || instance.instance_name,
      gpu_type: (instance as any).gpu_type,
      num_gpu: (instance as any).num_gpu || (instance as any).num_gpus,
      storage: instance.storage,
      is_high_disk: instance.is_high_disk,
      is_vm: instance.is_vm || false
    }

    const res = await fetchWithRetry(`${JARVIS_API_BASE}/templates/${template}/resume`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const detail = await res.text()
      throw new Error(`Failed to resume instance: ${res.status} ${detail}`)
    }
    return true
  },

  async pause(instance: JarvisInstance) {
    const id = instance.instance_id
    const isVm = instance.is_vm || (instance as any).template === 'vm'
    const endpoint = isVm ? '/templates/vm/pause' : '/misc/pause'
    
    console.log(`[Jarvis] Pausing instance ${id} via ${endpoint}...`)
    
    const res = await fetchWithRetry(`${JARVIS_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ machine_id: id.toString() })
    })

    if (!res.ok) {
      const detail = await res.text()
      throw new Error(`Failed to pause instance: ${res.status} ${detail}`)
    }
    return true
  },

  /**
   * Safe version of pause that resolves the instance first and swallows errors.
   * Useful for "fire-and-forget" cleanup in API routes.
   */
  async safePause(instanceIdOrName: string | number) {
    try {
      console.log(`[Jarvis] Triggering Safe Pause for '${instanceIdOrName}'...`)
      const instance = await this.getStatus(instanceIdOrName)
      if (instance.status === 'Running') {
        await this.pause(instance)
        console.log(`[Jarvis] Safe Pause successful for ${instance.instance_id}`)
      } else {
        console.log(`[Jarvis] Safe Pause skipped: Status is already ${instance.status}`)
      }
    } catch (err: any) {
      console.warn(`[Jarvis] Safe Pause failed (non-critical):`, err.message || err)
    }
  },

  async getStatus(instanceIdOrName: string | number): Promise<JarvisInstance> {
    try {
      // JLClient uses /users/fetch to get all instances
      const res = await fetchWithRetry(`${JARVIS_API_BASE}/users/fetch`, { headers: authHeaders() })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Failed to fetch Jarvis instances: ${res.status} ${errText}`)
      }
      const data = await res.json()
      
      // Data might be an array or { instances: [] } depending on the exact version
      const instances: JarvisInstance[] = Array.isArray(data) ? data : (data.instances || [])
      
      // Try finding by ID first
      let target = instances.find(i => 
        i?.machine_id?.toString() === instanceIdOrName?.toString() ||
        i?.instance_id?.toString() === instanceIdOrName?.toString() ||
        (i as any)?.id?.toString() === instanceIdOrName?.toString()
      )
      
      // If not found by ID, try finding by Name (case-insensitive)
      if (!target) {
        target = instances.find(i => 
          i?.name?.toLowerCase() === instanceIdOrName?.toString().toLowerCase() ||
          i?.instance_name?.toLowerCase() === instanceIdOrName?.toString().toLowerCase()
        )
      }

      if (!target) throw new Error(`Instance/Machine '${instanceIdOrName}' not found in your Jarvislabs account.`)
      
      // Normalize ID (Source of truth is machine_id for this region)
      const finalId = target.machine_id || target.instance_id || (target as any).id
      target.machine_id = finalId
      target.instance_id = finalId
      target.id = finalId

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
    
    // JarvisLabs 'url' points to Jupyter (8888). 
    // The 'endpoints' array contains URLs for other ports (8080, etc.)
    // We prefer the first custom endpoint if available.
    if (instance.endpoints && instance.endpoints.length > 0) {
      const apiUrl = instance.endpoints[0]
      return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
    }

    if (!instance.url) {
      const fallback = process.env.NEXT_PUBLIC_JARVIS_API_URL?.trim()
      if (!fallback) throw new Error(`Instance ${instanceIdOrName} has no URL and no fallback is configured.`)
      return fallback
    }
    return instance.url.endsWith('/') ? instance.url.slice(0, -1) : instance.url
  },

  /**
   * Performs a single readiness check (no polling).
   * If the instance is Paused, it triggers a resume and returns null.
   * If the instance is Running, it checks the heartbeat.
   *   - If healthy, it returns the URL.
   *   - If not healthy (FastAPI still booting), it returns null.
   */
  async checkReady(instanceIdOrName: string | number): Promise<string | null> {
    const instance = await this.getStatus(instanceIdOrName)
    
    if (instance.status === 'Paused') {
      console.log(`[Jarvis] Instance ${instance.instance_id} is Paused. Resuming...`)
      await this.resume(instance)
      return null
    }

    if (instance.status === 'Running') {
      const currentUrl = instance.url || process.env.NEXT_PUBLIC_JARVIS_API_URL
      if (currentUrl) {
        const isHealthy = await this.heartbeat(currentUrl)
        if (isHealthy) {
          console.log(`[Jarvis] GPU ready at ${currentUrl}`)
          return currentUrl
        }
      }
    }

    console.log(`[Jarvis] GPU is in '${instance.status}' state but not yet responding.`)
    return null
  },

  /**
   * @deprecated Use checkReady() in serverless routes to avoid timeouts.
   * Waits until the instance is Running AND its FastAPI server is responding.
   */
  async waitForReady(instanceIdOrName: string | number, maxAttempts = 20): Promise<string> {
    console.log(`[Jarvis] Waiting for GPU instance '${instanceIdOrName}' to be ready...`)
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const url = await this.checkReady(instanceIdOrName)
        if (url) return url
        
        console.log(`[Jarvis] Polling attempt ${i + 1}/${maxAttempts}...`)
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
