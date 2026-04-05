import fs from 'fs'
import dotenv from 'dotenv'

// Load .env.local
const envFile = fs.readFileSync('.env.local', 'utf8')
const env = dotenv.parse(envFile)

const JARVIS_API_KEY = env.JARVISLABS_API_KEY?.trim()

async function test(name, url, headers) {
    console.log(`\nTesting ${name}...`)
    console.log(`URL: ${url}`)
    try {
        const res = await fetch(url, { headers, signal: AbortSignal.timeout(5000) })
        console.log(`Status: ${res.status}`)
        const text = await res.text()
        console.log(`Response: ${text.substring(0, 100)}`)
    } catch (e) {
        console.log(`Error: ${e.message}`)
    }
}

async function run() {
    if (!JARVIS_API_KEY) return console.error('No key')

    // 1. Legacy BackendProd with Bearer
    await test('Legacy-Bearer', 'https://backendprod.jarvislabs.net/users/fetch', {
        'Authorization': `Bearer ${JARVIS_API_KEY}`
    })

    // 2. Legacy BackendProd with Token
    await test('Legacy-Token', 'https://backendprod.jarvislabs.net/users/fetch', {
        'Authorization': `Token ${JARVIS_API_KEY}`
    })

    // 3. New API with X-API-KEY
    await test('NewAPI-XKEY', 'https://api.jarvislabs.ai/v1/instances', {
        'X-API-KEY': JARVIS_API_KEY
    })

    // 4. New API Cloud with X-API-KEY
    await test('CloudAPI-XKEY', 'https://cloud.jarvislabs.ai/api/v1/instances', {
        'X-API-KEY': JARVIS_API_KEY
    })
    
    // 5. New API Cloud with Bearer
    await test('CloudAPI-Bearer', 'https://cloud.jarvislabs.ai/api/v1/instances', {
        'Authorization': `Bearer ${JARVIS_API_KEY}`
    })
}

run()
