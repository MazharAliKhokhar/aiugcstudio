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

// ─── Caching ──────────────────────────────────────────────────────────────────
let statusCache: { data: JarvisInstance[], timestamp: number } | null = null
const CACHE_TTL_MS = 10000 // 10s

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
      let instances: JarvisInstance[] = []
      
      // 1. Check cache first to avoid rate-limiting
      if (statusCache && Date.now() - statusCache.timestamp < CACHE_TTL_MS) {
        instances = statusCache.data
      } else {
        // JLClient uses /users/fetch to get all instances
        const res = await fetchWithRetry(`${JARVIS_API_BASE}/users/fetch`, { headers: authHeaders() })
        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`Failed to fetch Jarvis instances: ${res.status} ${errText}`)
        }
        const data = await res.json()
        instances = Array.isArray(data) ? data : (data.instances || [])
        
        // Update cache
        statusCache = { data: instances, timestamp: Date.now() }
      }
      
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
   * Resolves the current proxy URL for a given instance ID or name.
   * Prefers .proxy.jarvislabs.net for public API access.
   */
  async getResolvedUrl(instanceIdOrName: string | number): Promise<string> {
    const instance = await this.getStatus(instanceIdOrName)
    
    // Resolve the Base URL (Prefer endpoints[0] or derived .proxy URL)
    let baseUrl = ''
    
    // Try to find a .proxy URL in endpoints first
    const proxyEndpoint = instance.endpoints?.find(e => e.includes('.proxy.jarvislabs.net'))
    
    if (proxyEndpoint) {
      baseUrl = proxyEndpoint
    } else if (instance.endpoints && instance.endpoints.length > 0) {
      // If no .proxy found, try converting the first .notebooks one
      const first = instance.endpoints[0]
      baseUrl = first.includes('.notebooks.jarvislabs.net') 
        ? first.replace('.notebooks.jarvislabs.net', '.proxy.jarvislabs.net')
        : first
    } else if (instance.url) {
      // Fallback to main URL conversion
      const main = instance.url.split('/lab')[0]
      baseUrl = main.includes('.notebooks.jarvislabs.net')
        ? main.replace('.notebooks.jarvislabs.net', '.proxy.jarvislabs.net')
        : main
    }

    if (!baseUrl) {
      const fallback = process.env.NEXT_PUBLIC_JARVIS_API_URL?.trim()
      if (!fallback) throw new Error(`Instance ${instanceIdOrName} has no URL and no fallback is configured.`)
      baseUrl = fallback
    }

    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  },

  /**
   * Extracts the Jupyter token for the given instance to bypass the proxy login.
   */
  async getToken(instanceIdOrName: string | number): Promise<string | null> {
    try {
      const instance = await this.getStatus(instanceIdOrName)
      const tokenMatch = instance.url?.match(/token=([^&]+)/)
      return tokenMatch ? tokenMatch[1] : null
    } catch (e) {
      return null
    }
  },

  /**
   * Performs a single readiness check (no polling).
   * If the instance is Paused, it triggers a resume and returns null.
   * If the instance is Running, it checks the heartbeat of all possible endpoints.
   */
  async checkReady(instanceIdOrName: string | number): Promise<string | null> {
    const instance = await this.getStatus(instanceIdOrName)
    const token = await this.getToken(instanceIdOrName)
    
    if (instance.status === 'Paused') {
      console.log(`[Jarvis] Instance ${instance.instance_id} is Paused. Resuming...`)
      await this.resume(instance)
      return null
    }

    if (instance.status === 'Running') {
      // 1. Gather all possible candidate URLs
      const rawCandidates = [
        process.env.NEXT_PUBLIC_JARVIS_API_URL?.trim(), // Try the static one from .env first
        ...(instance.endpoints || []),
        instance.url?.split('/lab')[0] || ''
      ].filter(Boolean) as string[]

      const candidates: string[] = []
      for (const url of rawCandidates) {
        const clean = url.endsWith('/') ? url.slice(0, -1) : url
        if (!candidates.includes(clean)) candidates.push(clean)
        
        // Also try the .proxy variant if it's a .notebooks URL
        if (clean.includes('.notebooks.jarvislabs.net')) {
          const proxyVariant = clean.replace('.notebooks.jarvislabs.net', '.proxy.jarvislabs.net')
          if (!candidates.includes(proxyVariant)) candidates.push(proxyVariant)
        }
      }

      // 2. Scan all candidates for a healthy responding API
      for (const baseUrl of candidates) {
        // Try multiple health paths
        for (const path of ['/health', '/']) {
          const isHealthy = await this.heartbeat(baseUrl, path, token)
          if (isHealthy) {
            console.log(`[Jarvis] GPU verified at ${baseUrl}${path === '/' ? '' : path}`)
            return baseUrl
          }
        }
      }
    }

    console.log(`[Jarvis] GPU is in '${instance.status}' state but API is not yet responding.`)
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
  async heartbeat(baseUrl: string, path: string = '/health', token: string | null = null): Promise<boolean> {
    const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    const testUrl = `${cleanUrl}${path}`
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Token ${token}`
    }

    try {
      console.log(`[Jarvis] Checking heartbeat at ${testUrl}...`)
      const res = await fetch(testUrl, { 
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(3000), 
      })

      if (res.status === 200) {
        const contentType = res.headers.get('content-type') || ''
        // If it's HTML, we likely hit a Jupyter dashboard login page, not our API
        if (contentType.includes('text/html')) {
          console.warn(`[Jarvis] Heartbeat at ${testUrl} returned HTML (likely Jupyter), not FastAPI.`)
          return false
        }
        return true
      }
      return false
    } catch (e) {
      // Don't log full errors to avoid spamming console
      return false
    }
  }
}
