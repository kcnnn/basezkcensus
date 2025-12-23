'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the census app to avoid SSR issues
const CensusApp = dynamic(() => import('./components/CensusApp'), {
  ssr: false,
  loading: () => <div className="loading">Loading...</div>
})

export default function Home() {
  return <CensusApp />
}

