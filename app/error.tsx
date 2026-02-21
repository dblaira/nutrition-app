'use client'

import { useEffect } from 'react'
import { logError } from '@/lib/debug-logger'

const C = {
  sun: '#F2C744',
  terra: '#D4654A',
  charcoal: '#2C2C2C',
  warmGray: '#8C7B6B',
  white: '#FFFFFF',
  cream: '#FFFDF5',
  sand: '#FAF0DB',
  red: '#CC2936',
}

const fontFamily = `'Outfit', 'Avenir Next', 'Helvetica Neue', sans-serif`

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logError('Page Crash', error.message, {
      stack: error.stack,
      digest: error.digest,
    })
  }, [error])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${C.sun} 0%, ${C.cream} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily,
      }}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 24,
          padding: '40px 28px',
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 6px 30px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: C.red + '15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 32,
          }}
        >
          !
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: C.charcoal,
            margin: '0 0 12px',
          }}
        >
          Something broke
        </h1>

        <p
          style={{
            fontSize: 16,
            color: C.warmGray,
            margin: '0 0 20px',
            lineHeight: 1.5,
          }}
        >
          This page crashed. The error has been logged automatically.
        </p>

        <div
          style={{
            background: C.sand,
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 24,
            textAlign: 'left',
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.red,
              margin: 0,
              fontFamily: 'monospace',
              wordBreak: 'break-word',
            }}
          >
            {error.message}
          </p>
        </div>

        <button
          onClick={reset}
          style={{
            width: '100%',
            height: 52,
            background: C.terra,
            color: C.white,
            border: 'none',
            borderRadius: 16,
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily,
          }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
