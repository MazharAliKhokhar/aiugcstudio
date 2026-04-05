import fs from 'fs'
import dotenv from 'dotenv'

// Load .env.local
const envFile = fs.readFileSync('.env.local', 'utf8')
const env = dotenv.parse(envFile)

const JARVIS_API_KEY = env.JARVISLABS_API_KEY?.trim()
const JARVIS_API_BASE = 'https://backendprod.jarvislabs.net'
const INSTANCE_NAME = env.JARVISLABS_INSTANCE_NAME?.trim()
const INSTANCE_ID = env.JARVISLABS_INSTANCE_ID?.trim()

console.log('--- JarvisLabs Diagnostic ---')
console.log('API Key Found:', !!JARVIS_API_KEY)
console.log('Instance Name:', INSTANCE_NAME)
console.log('Instance ID from Env:', INSTANCE_ID)

async function run() {
  if (!JARVIS_API_KEY) {
    console.error('Error: JARVISLABS_API_KEY missing from .env.local')
    return
  }

  try {
    console.log(`\n1. Fetching instances from ${JARVIS_API_BASE}/users/fetch...`)
    const res = await fetch(`${JARVIS_API_BASE}/users/fetch`, {
      headers: {
        'Authorization': `Bearer ${JARVIS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      console.error(`Fetch failed with status ${res.status}: ${await res.text()}`)
      return
    }

    const data = await res.json()
    const instances = Array.isArray(data) ? data : (data.instances || [])
    
    console.log(`Found ${instances.length} instances.`)
    
    instances.forEach((inst, i) => {
      console.log(`\nInstance #${i + 1}:`)
      console.log(` - ID (machine_id): ${inst.machine_id}`)
      console.log(` - ID (instance_id): ${inst.instance_id}`)
      console.log(` - Name: ${inst.name || inst.instance_name}`)
      console.log(` - Status: ${inst.status}`)
      console.log(` - Region: ${inst.region || 'unknown'}`)
      console.log(` - Endpoints: ${JSON.stringify(inst.endpoints)}`)
    })

    const target = instances.find(i => 
      (i.name || i.instance_name)?.toLowerCase() === INSTANCE_NAME?.toLowerCase()
    )

    if (target) {
      console.log(`\n--- MATCH FOUND: '${INSTANCE_NAME}' ---`)
      console.log(`Current Status: ${target.status}`)
      console.log(`Current ID: ${target.machine_id || target.instance_id}`)
    } else {
      console.log(`\n--- NO MATCH FOUND for '${INSTANCE_NAME}' ---`)
      console.log('Scanning by ID from Env...')
      const idMatch = instances.find(i => 
        i.machine_id?.toString() === INSTANCE_ID || i.instance_id?.toString() === INSTANCE_ID
      )
      if (idMatch) {
         console.log(`Found by ID only! Current Name: ${idMatch.name || idMatch.instance_name}`)
      }
    }

  } catch (err) {
    console.error('Diagnostic error:', err)
  }
}

run()
