import fs from 'fs'
import dotenv from 'dotenv'

// Load .env.local
const envFile = fs.readFileSync('.env.local', 'utf8')
const env = dotenv.parse(envFile)

const JARVIS_API_KEY = env.JARVISLABS_API_KEY?.trim()
const JARVIS_API_BASE = 'https://api.jarvislabs.ai/v1' // Modern API
const INSTANCE_NAME = env.JARVISLABS_INSTANCE_NAME?.trim()
const INSTANCE_ID = '393106' // Hardcoded from user's screenshot for testing

console.log('--- JarvisLabs Modern Diagnostic ---')
console.log('API Key Found:', !!JARVIS_API_KEY)
console.log('Target Instance ID:', INSTANCE_ID)

async function run() {
  if (!JARVIS_API_KEY) {
    console.error('Error: JARVISLABS_API_KEY missing from .env.local')
    return
  }

  try {
    console.log(`\n1. Fetching instances from ${JARVIS_API_BASE}/instances...`)
    const res = await fetch(`${JARVIS_API_BASE}/instances`, {
      headers: {
        'X-API-KEY': JARVIS_API_KEY,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      console.error(`Fetch failed with status ${res.status}: ${await res.text()}`)
      
      // Try /users/fetch on the new domain too
      console.log(`\n1b. Trying legacy path on new domain: ${JARVIS_API_BASE}/users/fetch...`)
      const res2 = await fetch(`${JARVIS_API_BASE}/users/fetch`, {
          headers: { 'X-API-KEY': JARVIS_API_KEY }
      })
      console.log(`Fallback status: ${res2.status}`)
      return
    }

    const data = await res.json()
    console.log('Data:', JSON.stringify(data, null, 2))

  } catch (err) {
    console.error('Diagnostic error:', err)
  }
}

run()
