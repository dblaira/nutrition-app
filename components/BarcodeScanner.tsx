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
}

export function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const [manualCode, setManualCode] = useState('')
  const [isLooking, setIsLooking] = useState(false)
  const [error, setError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout>()

  const lookupBarcode = useCallback(async (code: string) => {
    setIsLooking(true)
    setError('')
    try {
      const res = await fetch(`/api/barcode-lookup?code=${encodeURIComponent(code)}`)
      const data = await res.json()
      if (!res.ok || !data.found) {
        setError(data.error || 'Product not found')
        setIsLooking(false)
        return
      }
      onResult(data)
    } catch {
      setError('Lookup failed')
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

      // Use BarcodeDetector if available
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
            // Detection frame failed, keep trying
          }
        }, 500)
      }
    } catch {
      setError('Camera access denied. Enter barcode manually below.')
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

        {/* Camera view */}
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

        {/* Manual entry */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: '0.8rem', color: C.warmGray, fontFamily: "'Outfit', sans-serif", margin: '0 0 8px' }}>
            Or enter barcode manually:
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="e.g. 0049000042566"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                border: `2px solid ${C.sand}`, background: C.cream,
                fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif",
                outline: 'none', color: C.charcoal,
              }}
              onKeyDown={e => { if (e.key === 'Enter' && manualCode) lookupBarcode(manualCode) }}
            />
            <button
              onClick={() => lookupBarcode(manualCode)}
              disabled={!manualCode || isLooking}
              style={{
                padding: '10px 18px', borderRadius: 10, border: 'none',
                background: manualCode ? C.terra : C.sand,
                color: manualCode ? C.white : C.warmGray,
                fontSize: '0.85rem', fontWeight: 700, cursor: manualCode ? 'pointer' : 'not-allowed',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {isLooking ? '...' : 'Look Up'}
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: C.red, fontSize: '0.8rem', fontFamily: "'Outfit', sans-serif", margin: 0 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
