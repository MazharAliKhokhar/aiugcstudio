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

// ─── Caching ──────────────────────────────────────────────────────────────────
let statusCache: { data: JarvisInstance[], timestamp: number } | null = null
const CACHE_TTL_MS = 10000 // 10s for instance status list

// Cache for the final validated proxy URL of a specific instance
let resolvedUrlCache: Record<string, { url: string, timestamp: number }> = {}
const RESOLVED_URL_TTL_MS = 60000 // 60s

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const key = getApiKey()
  
  // Rotating headers for maximum compatibility across regional/legacy APIs
  const authMethods: Record<string, string>[] = [
    { 'Authorization': `Token ${key}` },
    { 'Authorization': `Bearer ${key}` },
    { 'X-API-KEY': key }
  ]

  let lastStatus = 0
  let lastError = ''

  for (const headers of authMethods) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...headers
        },
        signal: AbortSignal.timeout(45000) // Increased for slow boot responses
      })
      
      if (res.ok) return res
      lastStatus = res.status
      lastError = await res.text().catch(() => 'No error body')
      console.warn(`[Jarvis] ${url} failed with ${lastStatus}: ${lastError.substring(0, 50)}`)
    } catch (err: any) {
      lastError = err.message
    }
  }

  throw new Error(`Jarvis Request Failed (${lastStatus}): ${lastError}`)
}

export const jarvis = {
  /**
   * Clears all internal caches. Use this if an instance state changes unexpectedly.
   */
  clearCache() {
    statusCache = null
    resolvedUrlCache = {}
    console.log('[Jarvis] Caches cleared.')
  },

  async resume(instance: any): Promise<void> {
    const id = instance.machine_id || instance.instance_id || (instance as any).id
    const template = (instance as any).framework || 'pytorch'

    console.log(`[Jarvis] Hardened Resume triggered for ID ${id}. Sending dual-signal wake-up...`)

    // 1. Send signal to Modern API (v1 REST)
    const modernUrl = `https://api.jarvislabs.ai/v1/instances/${id}?action=resume`
    const modernP = fetchWithAuth(modernUrl, { method: 'PUT' })
      .then(() => console.log(`[Jarvis] Modern Resume Signal Accepted for ${id}`))
      .catch(e => console.warn(`[Jarvis] Modern Resume Signal Rejected: ${e.message}`))

    // 2. Send signal to Legacy SDK API
    const legacyUrl = `${JARVIS_API_BASE}/templates/${template}/resume`
    const legacyPayload = {
      machine_id: id,
      instance_id: id,
      framework_id: (instance as any).framework_id,
      framework: template,
      image_format: (instance as any).image_format || 'pytorch',
      name: instance.name || instance.instance_name,
      gpu_type: instance.gpu_type || 'RTX6000Ada',
      num_gpu: instance.num_gpu || 1,
      storage: instance.storage || 50,
      is_high_disk: instance.is_high_disk || false,
      is_vm: instance.is_vm || false
    }

    const legacyP = fetchWithAuth(legacyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(legacyPayload)
    })
      .then(() => console.log(`[Jarvis] Legacy Resume Signal Accepted for ${id}`))
      .catch(e => console.warn(`[Jarvis] Legacy Resume Signal Rejected: ${e.message}`))

    // We proceed once AT LEAST ONE signal is processed (or both fail)
    // We don't block the whole UI for this, as we poll later
    await Promise.allSettled([modernP, legacyP])
  },

  async pause(instance: JarvisInstance) {
    const id = instance.instance_id
    const isVm = instance.is_vm || (instance as any).template === 'vm'
    const legacyEndpoint = isVm ? '/templates/vm/pause' : '/misc/pause'
    
    console.log(`[Jarvis] Sending aggressive pause signal to instance ${id}...`)
    
    // We fire all three formats to both API versions to guarantee shutdown
    const results = await Promise.allSettled([
      // 1. Legacy Endpoint
      fetchWithAuth(`${JARVIS_API_BASE}${legacyEndpoint}`, {
        method: 'POST',
        body: JSON.stringify({ machine_id: id.toString() })
      }),
      // 2. Modern Endpoint
      fetchWithAuth(`https://api.jarvislabs.ai/v1/instances/${id}?action=pause`, {
        method: 'PUT'
      })
    ])

    const failed = results.some(r => r.status === 'rejected')
    if (failed) {
        console.warn('[Jarvis] One or more pause signals failed, but at least one likely succeeded.')
    }

    this.clearCache() // Invalidate cache after state change
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
        // Core Fetch with Auth Retries
        const res = await fetchWithAuth(`${JARVIS_API_BASE}/users/fetch`)
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
    const key = instanceIdOrName.toString()
    
    // Check resolved URL cache (longer TTL than status cache)
    if (resolvedUrlCache[key] && Date.now() - resolvedUrlCache[key].timestamp < RESOLVED_URL_TTL_MS) {
      return resolvedUrlCache[key].url
    }

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

    const finalUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    
    // Cache the result
    resolvedUrlCache[key] = { url: finalUrl, timestamp: Date.now() }
    return finalUrl
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
    
    if (instance.status === 'Paused') {
      console.log(`[Jarvis] Instance ${instance.instance_id} is Paused. Resuming...`)
      await this.resume(instance)
      return null
    }

    if (instance.status === 'Running') {
      const key = instanceIdOrName.toString()
      const baseUrl = await this.getResolvedUrl(instanceIdOrName)
      const token = await this.getToken(instanceIdOrName)
      
      console.log(`[Jarvis] Checking heartbeat for Running instance ${instance.instance_id} at ${baseUrl}...`)
      
      // 1. Try the primary/cached URL
      if (await this.heartbeat(baseUrl, '/health', token)) return baseUrl
      if (await this.heartbeat(baseUrl, '/', token)) return baseUrl

      // 2. If primary fails, scan all possible candidates
      console.warn(`[Jarvis] Primary URL ${baseUrl} not responding. Scanning all candidates...`)
      const rawCandidates = [
        process.env.NEXT_PUBLIC_JARVIS_API_URL?.trim(),
        ...(instance.endpoints || []),
        instance.url?.split('/lab')[0] || ''
      ].filter(Boolean) as string[]

      for (const url of rawCandidates) {
        const clean = url.endsWith('/') ? url.slice(0, -1) : url
        const targets = [clean]
        
        // Convert notebook URLs to proxy URLs
        if (clean.includes('.notebooks.jarvislabs.net')) {
          targets.push(clean.replace('.notebooks.jarvislabs.net', '.proxy.jarvislabs.net'))
        }

        for (const testUrl of targets) {
          if (testUrl === baseUrl) continue
          console.log(`[Jarvis] Probing candidate: ${testUrl}`)
          if (await this.heartbeat(testUrl, '/health', token) || await this.heartbeat(testUrl, '/', token)) {
            console.log(`[Jarvis] Found working URL: ${testUrl}. Updating cache.`)
            resolvedUrlCache[key] = { url: testUrl, timestamp: Date.now() }
            return testUrl
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

