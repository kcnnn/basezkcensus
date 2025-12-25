// In-memory storage fallback for when Vercel KV is not configured
// Note: Data will be reset when the server restarts
let useInMemoryStorage = false

// Try to import Vercel KV, fall back to in-memory if not available
let kv: any
try {
  const kvModule = require('@vercel/kv')
  kv = kvModule.kv
  
  // Test if KV is configured by checking for environment variables
  if (!process.env.KV_REST_API_URL && !process.env.KV_URL) {
    console.warn('⚠️ Vercel KV not configured. Using in-memory storage (data will not persist).')
    useInMemoryStorage = true
  }
} catch (error) {
  console.warn('⚠️ @vercel/kv not available. Using in-memory storage.')
  useInMemoryStorage = true
}

// In-memory storage
interface CensusEntry {
  nationality: string
  timestamp: number
}

const inMemoryStorage: {
  census: Map<string, CensusEntry>
  countryCounts: Map<string, number>
} = {
  census: new Map(),
  countryCounts: new Map()
}

// Helper functions for census data operations
export async function storeCensusEntry(address: string, nationality: string) {
  const lowercaseAddress = address.toLowerCase()
  
  if (useInMemoryStorage) {
    // In-memory storage implementation
    const existing = inMemoryStorage.census.get(lowercaseAddress)
    
    // Store the census entry
    inMemoryStorage.census.set(lowercaseAddress, {
      nationality,
      timestamp: Date.now()
    })
    
    // Update country counts
    if (!existing) {
      const currentCount = inMemoryStorage.countryCounts.get(nationality) || 0
      inMemoryStorage.countryCounts.set(nationality, currentCount + 1)
    } else if (existing.nationality !== nationality) {
      // Nationality changed, update both counts
      const oldCount = inMemoryStorage.countryCounts.get(existing.nationality) || 0
      inMemoryStorage.countryCounts.set(existing.nationality, Math.max(0, oldCount - 1))
      
      const newCount = inMemoryStorage.countryCounts.get(nationality) || 0
      inMemoryStorage.countryCounts.set(nationality, newCount + 1)
    }
    
    return { success: true }
  }
  
  // Vercel KV implementation
  const existing = await kv.hget('census', lowercaseAddress)
  
  await kv.hset('census', {
    [lowercaseAddress]: {
      nationality,
      timestamp: Date.now()
    }
  })
  
  if (!existing) {
    await kv.incr(`country:${nationality}`)
  } else if ((existing as any).nationality !== nationality) {
    await kv.decr(`country:${(existing as any).nationality}`)
    await kv.incr(`country:${nationality}`)
  }
  
  return { success: true }
}

export async function getCensusStats() {
  if (useInMemoryStorage) {
    // In-memory storage implementation
    const total = inMemoryStorage.census.size
    const countries: { country: string; count: number }[] = []
    
    inMemoryStorage.countryCounts.forEach((count, country) => {
      if (count > 0) {
        countries.push({ country, count })
      }
    })
    
    // Sort by count descending, then by country name
    countries.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count
      }
      return a.country.localeCompare(b.country)
    })
    
    return { countries, total }
  }
  
  // Vercel KV implementation
  const censusEntries = await kv.hgetall('census') || {}
  const total = Object.keys(censusEntries).length
  
  const keys = await kv.keys('country:*')
  const countries: { country: string; count: number }[] = []
  
  for (const key of keys) {
    const count = await kv.get(key) as number
    if (count && count > 0) {
      const country = key.replace('country:', '')
      countries.push({ country, count })
    }
  }
  
  countries.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count
    }
    return a.country.localeCompare(b.country)
  })
  
  return { countries, total }
}

export { kv }

