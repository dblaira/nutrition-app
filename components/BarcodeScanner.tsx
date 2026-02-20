'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface BarcodeScannerProps {
  onResult: (product: any) => void
  onClose: () => void
}

const C = {
  terra: '#D4654A',
  charcoal: '#2C2C2C',
  warmGray: '#8C7B6B',
  white: '#FFFFFF',
  cream: '#FFFDF5',
  sand: '#FAF0DB',
  red: '#CC2936',
  fab: '#2AA9DB',
}

export function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const [manualCode, setManualCode] = useState('')
  const [isLooking, setIsLooking] = useState(false)
  const [error, setError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraScanSupported, setCameraScanSupported] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const manualInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const supported = 'BarcodeDetector' in window
    setCameraScanSupported(supported)
    if (!supported) {
      setTimeout(() => manualInputRef.current?.focus(), 200)
    }
  }, [])

  const lookupBarcode = useCallback(async (code: string) => {
    setIsLooking(true)
    setError('')
    try {
      const res = await fetch(`/api/barcode-lookup?code=${encodeURIComponent(code)}`)
      const data = await res.json()
      if (!res.ok || !data.found) {
        if (res.status === 404) {
          setError(
            `No nutrition info found for barcode ${code}. This product may not be in the database yet. You can log it manually using the text input instead.`
          )
        } else {
          setError(data.error || 'Something went wrong looking up that barcode. Try again.')
        }
        setIsLooking(false)
        return
      }
      onResult(data)
    } catch {
      setError('Could not reach the barcode database. Check your internet connection and try again.')
    }
    setIsLooking(false)
  }, [onResult])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)

      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
        })

        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current) return
          try {
            const barcodes = await detector.detect(videoRef.current)
            if (barcodes.length > 0) {
              clearInterval(scanIntervalRef.current)
              stopCamera()
              lookupBarcode(barcodes[0].rawValue)
            }
          } catch {
            // frame failed, keep trying
          }
        }, 500)
      }
    } catch {
      setError('Camera access was blocked. You can allow it in your browser settings, or type the barcode number below.')
      setCameraScanSupported(false)
      setTimeout(() => manualInputRef.current?.focus(), 200)
    }
  }, [lookupBarcode])

  const stopCamera = useCallback(() => {
    clearInterval(scanIntervalRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  useEffect(() => {
    return () => { stopCamera() }
  }, [stopCamera])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2500,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: 'min(400px, 100%)',
        background: C.white,
        borderRadius: 24,
        padding: 24,
        maxHeight: 'calc(100vh - 48px)',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: C.charcoal, fontFamily: "'Outfit', sans-serif" }}>
            Scan Barcode
          </h3>
          <button onClick={() => { stopCamera(); onClose() }} style={{
            background: 'none', border: 'none', fontSize: '1.5rem', color: C.warmGray, cursor: 'pointer',
          }}>×</button>
        </div>

        {/* Camera scanning — only show if the browser supports it */}
        {cameraScanSupported && (
          <>
            {!cameraActive ? (
              <button onClick={startCamera} style={{
                width: '100%', padding: '40px 20px', borderRadius: 16,
                border: `3px dashed ${C.sand}`, background: C.cream,
                color: C.charcoal, fontSize: '0.9rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                marginBottom: 16,
              }}>
                Open Camera to Scan
              </button>
            ) : (
              <div style={{ position: 'relative', marginBottom: 16, borderRadius: 16, overflow: 'hidden' }}>
                <video
                  ref={videoRef}
                  style={{ width: '100%', borderRadius: 16, display: 'block' }}
                  playsInline
                  muted
                />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    width: '70%', height: 3, background: C.terra, opacity: 0.8, borderRadius: 2,
                  }} />
                </div>
                <button onClick={stopCamera} style={{
                  position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)', border: 'none', color: C.white, fontSize: '1rem', cursor: 'pointer',
                }}>×</button>
              </div>
            )}
          </>
        )}

        {/* Message when camera scanning isn't available */}
        {!cameraScanSupported && (
          <div style={{
            padding: '16px 18px', borderRadius: 16, background: '#FFF8E1',
            border: '2px solid #FFE082', marginBottom: 16,
            fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem',
            color: C.charcoal, lineHeight: 1.5,
          }}>
            Camera scanning isn&apos;t available on this browser. Type the barcode number from the package below.
          </div>
        )}

        {/* Manual barcode entry */}
        <div style={{ marginBottom: 12 }}>
          <p style={{
            fontSize: '0.85rem', color: C.charcoal, fontFamily: "'Outfit', sans-serif",
            margin: '0 0 10px', fontWeight: 600,
          }}>
            {cameraScanSupported ? 'Or type the barcode number:' : 'Enter the barcode number:'}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={manualInputRef}
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="e.g. 0049000042566"
              inputMode="numeric"
              style={{
                flex: 1, padding: '14px 16px', borderRadius: 12,
                border: `2px solid ${C.sand}`, background: C.cream,
                fontSize: '1.1rem', fontFamily: "'Outfit', sans-serif",
                outline: 'none', color: C.charcoal, fontWeight: 600,
              }}
              onFocus={e => { e.currentTarget.style.borderColor = C.fab }}
              onBlur={e => { e.currentTarget.style.borderColor = C.sand }}
              onKeyDown={e => { if (e.key === 'Enter' && manualCode) lookupBarcode(manualCode) }}
            />
            <button
              onClick={() => lookupBarcode(manualCode)}
              disabled={!manualCode || isLooking}
              style={{
                padding: '14px 20px', borderRadius: 12, border: 'none',
                background: manualCode ? C.fab : C.sand,
                color: manualCode ? C.white : C.warmGray,
                fontSize: '1rem', fontWeight: 700, cursor: manualCode ? 'pointer' : 'not-allowed',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {isLooking ? '...' : 'Look Up'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            color: C.red, fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif",
            margin: 0, lineHeight: 1.5, padding: '12px 14px',
            background: '#FFF0F0', borderRadius: 12,
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
