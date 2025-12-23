import { NextRequest, NextResponse } from 'next/server'
import { storeCensusEntry } from '@/lib/kv'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, nationality } = body
    
    if (!address || !nationality) {
      return NextResponse.json(
        { error: 'Address and nationality are required' },
        { status: 400 }
      )
    }
    
    await storeCensusEntry(address, nationality)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting census data:', error)
    return NextResponse.json(
      { error: 'Failed to submit census data' },
      { status: 500 }
    )
  }
}

