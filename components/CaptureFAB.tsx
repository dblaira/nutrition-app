'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { saveIntake } from '@/app/actions/intake'
import { BarcodeScanner } from './BarcodeScanner'

interface FoodItem {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  caffeine_mg: number
  confidence: 'high' | 'medium' | 'low'
}

interface InferredIntake {
  type: 'food' | 'water' | 'caffeine' | 'supplement' | 'multi'
  meal_name?: string | null
  items?: FoodItem[]
  water_oz?: number | null
  caffeine_source?: string | null
  caffeine_mg?: number | null
  supplements?: string[] | null
  raw_text: string
}

type FABState = 'closed' | 'input' | 'confirming'

const C = {
  sun: '#F2C744',
  terra: '#D4654A',
  terraLight: '#E8896F',
  ocean: '#2B7FB5',
  charcoal: '#2C2C2C',
  warmGray: '#8C7B6B',
  white: '#FFFFFF',
  cream: '#FFFDF5',
  sand: '#FAF0DB',
  red: '#CC2936',
  navy: '#0A1F44',
  fab: '#2AA9DB',
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
}

export function CaptureFAB({ onEntryCreated }: { onEntryCreated?: () => void }) {
  const [state, setState] = useState<FABState>('closed')
  const [inputText, setInputText] = useState('')
  const [isInferring, setIsInferring] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [inferredData, setInferredData] = useState<InferredIntake | null>(null)
  const [error, setError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    setVoiceSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition))
    return () => { recognitionRef.current?.abort() }
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.abort()
    recognitionRef.current = null
    setIsListening(false)
  }, [])

  const startListening = useCallback(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) return
    stopListening()

    const recognition = new SpeechRec()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1]
      if (last?.[0]) {
        const text = last[0].transcript
        setInputText(prev => prev ? `${prev} ${text}` : text)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.warn('Speech error:', event.error)
      }
      setIsListening(false)
    }

    recognition.onend = () => { setIsListening(false) }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [stopListening])

  const handleBarcodeResult = (product: any) => {
    setShowBarcodeScanner(false)
    // Populate inferred data directly from barcode lookup
    setInferredData({
      type: 'food',
      meal_name: null,
      items: [{
        name: product.name,
        quantity: 1,
        unit: product.serving_size || '1 serving',
        calories: product.calories,
        protein: product.protein,
        carbs: product.carbs,
        fat: product.fat,
        caffeine_mg: 0,
        confidence: 'high',
      }],
      water_oz: null,
      caffeine_source: null,
      caffeine_mg: null,
      supplements: null,
      raw_text: `Barcode: ${product.barcode} - ${product.name}`,
    })
    setState('confirming')
  }

  const handleOpen = () => {
    setState('input')
    setError('')
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const handleClose = () => {
    setState('closed')
    setInputText('')
    setInferredData(null)
    setError('')
  }

  const handleInfer = async () => {
    if (!inputText.trim()) return
    setIsInferring(true)
    setError('')

    try {
      const res = await fetch('/api/infer-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputText.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to parse intake')
        setIsInferring(false)
        return
      }

      setInferredData(data)
      setState('confirming')
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setIsInferring(false)
    }
  }

  const handlePublish = async () => {
    if (!inferredData) return
    setIsPublishing(true)
    setError('')

    try {
      const result = await saveIntake({
        type: inferredData.type,
        meal_name: inferredData.meal_name,
        items: inferredData.items,
        water_oz: inferredData.water_oz,
        caffeine_source: inferredData.caffeine_source,
        caffeine_mg: inferredData.caffeine_mg,
        supplements: inferredData.supplements,
        external_source: 'ai_parsed',
      })

      if (result.error) {
        setError(result.error)
        setIsPublishing(false)
        return
      }

      onEntryCreated?.()
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setIsPublishing(false)
    }
  }

  // ── CLOSED ──
  if (state === 'closed') {
    return (
      <button
        onClick={handleOpen}
        aria-label="Log intake"
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          right: '24px',
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: C.fab,
          color: C.white,
          border: 'none',
          fontSize: '2rem',
          fontWeight: 300,
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(42, 169, 219, 0.45)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        +
      </button>
    )
  }

  // ── BARCODE SCANNER (must be checked before input state) ──
  if (showBarcodeScanner) {
    return (
      <BarcodeScanner
        onResult={handleBarcodeResult}
        onClose={() => setShowBarcodeScanner(false)}
      />
    )
  }

  // ── INPUT ──
  if (state === 'input') {
    return (
      <div style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        right: '24px',
        width: 'min(360px, calc(100vw - 48px))',
        background: C.white,
        borderRadius: 20,
        boxShadow: '0 8px 48px rgba(0,0,0,0.18)',
        padding: '20px',
        zIndex: 1000,
      }}>
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder='What did you have? e.g. "2 eggs and toast" or "16oz water" or "espresso"'
          style={{
            width: '100%',
            minHeight: 90,
            border: `2px solid ${C.sand}`,
            borderRadius: 12,
            padding: '14px',
            fontSize: '1rem',
            resize: 'vertical',
            outline: 'none',
            fontFamily: "'Outfit', sans-serif",
            color: C.charcoal,
            background: C.cream,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = C.terra }}
          onBlur={(e) => { e.currentTarget.style.borderColor = C.sand }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleInfer()
          }}
        />

        {error && (
          <p style={{ color: C.red, fontSize: '0.8rem', margin: '8px 0 0', fontFamily: "'Outfit', sans-serif" }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.warmGray,
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Barcode button */}
            <button
              onClick={() => setShowBarcodeScanner(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: `2px solid ${C.sand}`,
                background: C.cream,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Scan barcode"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={C.warmGray} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5V3h4" /><path d="M17 3h4v2" />
                <path d="M21 19v2h-4" /><path d="M7 21H3v-2" />
                <line x1="7" y1="8" x2="7" y2="16" />
                <line x1="11" y1="8" x2="11" y2="16" />
                <line x1="15" y1="8" x2="15" y2="16" />
              </svg>
            </button>
            {voiceSupported && (
              <button
                onClick={isListening ? stopListening : startListening}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: `2px solid ${isListening ? C.red : C.sand}`,
                  background: isListening ? C.red : C.cream,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                aria-label={isListening ? 'Stop recording' : 'Start voice input'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={isListening ? C.white : C.warmGray} strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            )}
            <button
              onClick={handleInfer}
              disabled={isInferring || !inputText.trim()}
              style={{
              background: C.fab,
              color: C.white,
              border: 'none',
              borderRadius: 12,
              padding: '10px 24px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: isInferring ? 'wait' : 'pointer',
              opacity: isInferring || !inputText.trim() ? 0.55 : 1,
              fontFamily: "'Outfit', sans-serif",
              transition: 'opacity 0.15s',
            }}
          >
            {isInferring ? 'Thinking...' : 'Capture ⌘↵'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── CONFIRMING ──
  if (state === 'confirming' && inferredData) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        right: '24px',
        width: 'min(360px, calc(100vw - 48px))',
        background: C.white,
        borderRadius: 20,
        boxShadow: '0 8px 48px rgba(0,0,0,0.18)',
        padding: '20px',
        zIndex: 1000,
        maxHeight: '70vh',
        overflowY: 'auto',
      }}>
        {/* Type badge */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <TypeBadge type={inferredData.type} />
          {inferredData.meal_name && (
            <span style={{
              padding: '4px 12px',
              background: C.sand,
              borderRadius: 20,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: C.charcoal,
              fontFamily: "'Outfit', sans-serif",
            }}>
              {inferredData.meal_name}
            </span>
          )}
        </div>

        {/* Food items */}
        {inferredData.items && inferredData.items.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            {inferredData.items.map((item, i) => (
              <div key={i} style={{
                padding: '12px 14px',
                background: C.cream,
                borderRadius: 14,
                marginBottom: 8,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: C.charcoal,
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {item.name}
                  </span>
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: C.terra,
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {Math.round(item.calories * item.quantity)} cal
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  gap: 12,
                  marginTop: 6,
                  fontSize: '0.75rem',
                  color: C.warmGray,
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                }}>
                  <span>{item.quantity} {item.unit}</span>
                  <span>P: {Math.round(item.protein * item.quantity)}g</span>
                  <span>C: {Math.round(item.carbs * item.quantity)}g</span>
                  <span>F: {Math.round(item.fat * item.quantity)}g</span>
                </div>
              </div>
            ))}

            {/* Totals row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderTop: `2px solid ${C.sand}`,
              marginTop: 4,
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.charcoal, fontFamily: "'Outfit', sans-serif" }}>
                Total
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: C.terra, fontFamily: "'Outfit', sans-serif" }}>
                {Math.round(inferredData.items.reduce((s, it) => s + it.calories * it.quantity, 0))} cal
              </span>
            </div>
          </div>
        )}

        {/* Water */}
        {inferredData.water_oz && inferredData.water_oz > 0 && (
          <div style={{
            padding: '12px 14px',
            background: '#E8F4FD',
            borderRadius: 14,
            marginBottom: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: C.ocean, fontFamily: "'Outfit', sans-serif" }}>
              Water
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: C.ocean, fontFamily: "'Outfit', sans-serif" }}>
              {inferredData.water_oz} oz
            </span>
          </div>
        )}

        {/* Caffeine */}
        {inferredData.caffeine_mg && inferredData.caffeine_mg > 0 && (
          <div style={{
            padding: '12px 14px',
            background: '#FFF3E0',
            borderRadius: 14,
            marginBottom: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: C.charcoal, fontFamily: "'Outfit', sans-serif" }}>
              {inferredData.caffeine_source || 'Caffeine'}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: C.charcoal, fontFamily: "'Outfit', sans-serif" }}>
              {inferredData.caffeine_mg} mg
            </span>
          </div>
        )}

        {/* Supplements */}
        {inferredData.supplements && inferredData.supplements.length > 0 && (
          <div style={{
            padding: '12px 14px',
            background: '#E8F5E9',
            borderRadius: 14,
            marginBottom: 14,
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2E7D32', fontFamily: "'Outfit', sans-serif" }}>
              Supplements
            </span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {inferredData.supplements.map((s, i) => (
                <span key={i} style={{
                  padding: '3px 10px',
                  background: '#C8E6C9',
                  borderRadius: 12,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#1B5E20',
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p style={{ color: C.red, fontSize: '0.8rem', margin: '0 0 10px', fontFamily: "'Outfit', sans-serif" }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => { setState('input'); setError('') }}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.warmGray,
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 500,
            }}
          >
            ← Edit
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            style={{
              background: C.fab,
              color: C.white,
              border: 'none',
              borderRadius: 12,
              padding: '10px 24px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: isPublishing ? 'wait' : 'pointer',
              opacity: isPublishing ? 0.55 : 1,
              fontFamily: "'Outfit', sans-serif",
              transition: 'opacity 0.15s',
            }}
          >
            {isPublishing ? 'Saving...' : 'Log It'}
          </button>
        </div>
      </div>
    )
  }

  return null
}

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    food: { bg: '#FDEBD0', color: '#E67E22', label: 'Food' },
    water: { bg: '#D6EAF8', color: '#2980B9', label: 'Water' },
    caffeine: { bg: '#FFF3E0', color: '#E65100', label: 'Caffeine' },
    supplement: { bg: '#E8F5E9', color: '#2E7D32', label: 'Supplement' },
    multi: { bg: '#F3E5F5', color: '#7B1FA2', label: 'Multiple' },
  }
  const c = config[type] || config.food
  return (
    <span style={{
      padding: '4px 12px',
      background: c.bg,
      borderRadius: 20,
      fontSize: '0.75rem',
      fontWeight: 700,
      color: c.color,
      fontFamily: "'Outfit', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {c.label}
    </span>
  )
}
