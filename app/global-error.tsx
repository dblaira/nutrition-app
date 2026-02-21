'use client'

/**
 * Global error boundary — catches errors in the root layout itself.
 * Must include its own <html> and <body> since the root layout may have crashed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: '#F2C744',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: `'Outfit', 'Avenir Next', 'Helvetica Neue', sans-serif`,
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: '40px 28px',
            maxWidth: 420,
            width: '100%',
            boxShadow: '0 6px 30px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#2C2C2C',
              margin: '0 0 12px',
            }}
          >
            App crashed
          </h1>

          <p
            style={{
              fontSize: 16,
              color: '#8C7B6B',
              margin: '0 0 20px',
              lineHeight: 1.5,
            }}
          >
            The whole app hit an error. This is rare.
          </p>

          <div
            style={{
              background: '#FAF0DB',
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
                color: '#CC2936',
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
              background: '#D4654A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 16,
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: `'Outfit', 'Avenir Next', 'Helvetica Neue', sans-serif`,
            }}
          >
            Reload app
          </button>
        </div>
      </body>
    </html>
  )
}
