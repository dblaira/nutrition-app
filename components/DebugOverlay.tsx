'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Trash2, RefreshCw, Bug } from 'lucide-react'
import {
  subscribe,
  getUnreadCount,
  clearUnread,
  getRecentErrors,
  markAllResolved,
  getUnresolvedCount,
  type AppError,
} from '@/lib/debug-logger'

const C = {
  charcoal: '#2C2C2C',
  warmGray: '#8C7B6B',
  white: '#FFFFFF',
  cream: '#FFFDF5',
  sand: '#FAF0DB',
  red: '#CC2936',
  green: '#27AE60',
  orange: '#E67E22',
  ocean: '#2B7FB5',
}

const fontFamily = `'Outfit', 'Avenir Next', 'Helvetica Neue', sans-serif`

function levelColor(level: string) {
  if (level === 'error') return C.red
  if (level === 'warn') return C.orange
  return C.ocean
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return ''
  }
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'Today'
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export function DebugOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [errors, setErrors] = useState<AppError[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [unread, setUnread] = useState(0)
  const [dbUnresolved, setDbUnresolved] = useState(0)

  useEffect(() => {
    const unsub = subscribe(() => setUnread(getUnreadCount()))
    getUnresolvedCount().then(setDbUnresolved)
    return unsub
  }, [])

  const hasErrors = unread > 0 || dbUnresolved > 0

  const loadErrors = useCallback(async () => {
    setLoading(true)
    const data = await getRecentErrors(50)
    setErrors(data)
    setLoading(false)
  }, [])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    clearUnread()
    loadErrors()
  }, [loadErrors])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setExpandedId(null)
  }, [])

  const handleClearAll = useCallback(async () => {
    await markAllResolved()
    setErrors([])
    setDbUnresolved(0)
  }, [])

  return (
    <>
      {/* Floating debug dot */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          aria-label="Open debug panel"
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
            right: 12,
            zIndex: 9999,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            background: hasErrors ? C.red : C.green,
            color: C.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: hasErrors
              ? '0 2px 12px rgba(204, 41, 54, 0.4)'
              : '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
        >
          <Bug size={18} />
          {hasErrors && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: C.white,
                color: C.red,
                fontSize: 11,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily,
              }}
            >
              {unread + dbUnresolved > 99 ? '99' : unread + dbUnresolved}
            </span>
          )}
        </button>
      )}

      {/* Full-screen debug panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: C.cream,
            display: 'flex',
            flexDirection: 'column',
            fontFamily,
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: `1px solid ${C.sand}`,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                color: C.charcoal,
              }}
            >
              Debug Log
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={loadErrors}
                aria-label="Refresh"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: C.sand,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={18} color={C.warmGray} />
              </button>
              <button
                onClick={handleClearAll}
                aria-label="Clear all errors"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: C.sand,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={18} color={C.warmGray} />
              </button>
              <button
                onClick={handleClose}
                aria-label="Close debug panel"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: C.charcoal + '10',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={20} color={C.charcoal} />
              </button>
            </div>
          </div>

          {/* Error list */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 20px 24px',
            }}
          >
            {loading && errors.length === 0 && (
              <p
                style={{
                  textAlign: 'center',
                  color: C.warmGray,
                  fontSize: 16,
                  padding: '40px 0',
                }}
              >
                Loading...
              </p>
            )}

            {!loading && errors.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 0',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: C.green + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: C.green,
                    fontSize: 28,
                    fontWeight: 800,
                  }}
                >
                  ✓
                </div>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: C.warmGray,
                    margin: 0,
                  }}
                >
                  No errors logged
                </p>
              </div>
            )}

            {errors.map((err) => {
              const isExpanded = expandedId === err.id
              return (
                <button
                  key={err.id}
                  onClick={() => setExpandedId(isExpanded ? null : (err.id ?? null))}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: C.white,
                    border: `2px solid ${isExpanded ? levelColor(err.level) + '40' : C.sand}`,
                    borderRadius: 16,
                    padding: '14px 16px',
                    marginBottom: 10,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                    fontFamily,
                  }}
                >
                  {/* Row: time + level + source */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: levelColor(err.level),
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '2px 8px',
                        background: levelColor(err.level) + '12',
                        borderRadius: 6,
                      }}
                    >
                      {err.level}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: C.warmGray,
                        fontWeight: 600,
                      }}
                    >
                      {err.created_at
                        ? `${formatDate(err.created_at)} ${formatTime(err.created_at)}`
                        : ''}
                    </span>
                  </div>

                  {/* Source */}
                  <p
                    style={{
                      margin: '0 0 4px',
                      fontSize: 15,
                      fontWeight: 700,
                      color: C.charcoal,
                    }}
                  >
                    {err.source}
                  </p>

                  {/* Message */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: C.warmGray,
                      lineHeight: 1.4,
                    }}
                  >
                    {err.message}
                  </p>

                  {/* Expanded context */}
                  {isExpanded && err.context && Object.keys(err.context).length > 0 && (
                    <pre
                      style={{
                        marginTop: 12,
                        padding: 12,
                        background: C.sand,
                        borderRadius: 10,
                        fontSize: 12,
                        color: C.charcoal,
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'monospace',
                        maxHeight: 300,
                      }}
                    >
                      {JSON.stringify(err.context, null, 2)}
                    </pre>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
