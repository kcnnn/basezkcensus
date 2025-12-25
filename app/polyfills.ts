// Polyfills for Node.js APIs in the browser
'use client'

import { Buffer } from 'buffer'

// Make Buffer available globally before any other code runs
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  ;(window as any).Buffer = Buffer;
  ;(globalThis as any).Buffer = Buffer
}

export {}

