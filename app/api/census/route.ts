import { NextResponse } from 'next/server'
import { getCensusStats } from '@/lib/kv'

export async function GET() {
  try {
    const stats = await getCensusStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting census stats:', error)
    return NextResponse.json(
      { countries: [], total: 0 },
      { status: 200 } // Return empty data rather than error
    )
  }
}

// Enable dynamic rendering for this route
export const dynamic = 'force-dynamic'

