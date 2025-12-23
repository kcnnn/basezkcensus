import { kv } from '@vercel/kv'

export { kv }

// Helper functions for census data operations
export async function storeCensusEntry(address: string, nationality: string) {
  const lowercaseAddress = address.toLowerCase()
  
  // Check if this address already exists
  const existing = await kv.hget('census', lowercaseAddress)
  
  // Store the census entry
  await kv.hset('census', {
    [lowercaseAddress]: {
      nationality,
      timestamp: Date.now()
    }
  })
  
  // If this is a new entry (not updating), increment the country count
  if (!existing) {
    await kv.incr(`country:${nationality}`)
  } else if ((existing as any).nationality !== nationality) {
    // If nationality changed, decrement old and increment new
    await kv.decr(`country:${(existing as any).nationality}`)
    await kv.incr(`country:${nationality}`)
  }
  
  return { success: true }
}

export async function getCensusStats() {
  // Get all census entries
  const censusEntries = await kv.hgetall('census') || {}
  const total = Object.keys(censusEntries).length
  
  // Get all country counts
  const keys = await kv.keys('country:*')
  const countries: { country: string; count: number }[] = []
  
  for (const key of keys) {
    const count = await kv.get<number>(key)
    if (count && count > 0) {
      const country = key.replace('country:', '')
      countries.push({ country, count })
    }
  }
  
  // Sort by count descending, then by country name
  countries.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count
    }
    return a.country.localeCompare(b.country)
  })
  
  return { countries, total }
}

