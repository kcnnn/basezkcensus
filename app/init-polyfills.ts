// This file MUST be imported first in any client component that uses ZKPassport
// It sets up global polyfills before any other code runs

import { Buffer } from 'buffer'

// Create a minimal process object for browser
const browserProcess = {
  env: {},
  version: '',
  versions: {},
  browser: true,
  nextTick: (fn: Function) => setTimeout(fn, 0),
}

// Set up globals immediately
if (typeof globalThis !== 'undefined') {
  ;(globalThis as any).Buffer = Buffer;
  (globalThis as any).process = browserProcess;
  (globalThis as any).global = globalThis
}

if (typeof window !== 'undefined') {
  ;(window as any).Buffer = Buffer;
  (window as any).process = browserProcess;
  (window as any).global = window
}

// Force the Buffer to be available
export { Buffer }

