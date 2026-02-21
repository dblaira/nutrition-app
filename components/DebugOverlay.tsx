'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { X, Trash2, RefreshCw, Bug, Plus, Check } from 'lucide-react'
import {
  subscribe,
  getUnreadCount,
  clearUnread,
  getRecentErrors,
  markAllResolved,
  getUnresolvedCount,
  saveFeedback,
  getRecentFeedback,
  resolveFeedback,
  deleteFeedback,
  type AppError,
  type AppFeedback,
  type FeedbackCategory,
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
  purple: '#7B1FA2',
}

const fontFamily = `'Outfit', 'Avenir Next', 'Helvetica Neue', sans-serif`

type Tab = 'errors' | 'feedback'

const CATEGORIES: { id: FeedbackCategory; label: string; color: string }[] = [
  { id: 'bug', label: 'Bug', color: C.red },
  { id: 'design', label: 'Design', color: C.purple },
  { id: 'feature', label: 'Feature', color: C.ocean },
  { id: 'observation', label: 'Observation', color: C.orange },
]

function categoryColor(cat: string) {
  return CATEGORIES.find((c) => c.id === cat)?.color || C.warmGray
}

function levelColor(level: string) {
  if (level === 'error') return C.red
  if (level === 'warn') return C.orange
  return C.ocean
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
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
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('errors')
  const [unread, setUnread] = useState(0)
  const [dbUnresolved, setDbUnresolved] = useState(0)

  // Errors state
  const [errors, setErrors] = useState<AppError[]>([])
  const [errorsLoading, setErrorsLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Feedback state
  const [feedbackItems, setFeedbackItems] = useState<AppFeedback[]>([])
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newCategory, setNewCategory] = useState<FeedbackCategory>('observation')
  const [newBody, setNewBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const unsub = subscribe(() => setUnread(getUnreadCount()))
    getUnresolvedCount().then(setDbUnresolved)
    return unsub
  }, [])

  const hasErrors = unread > 0 || dbUnresolved > 0

  const loadErrors = useCallback(async () => {
    setErrorsLoading(true)
    const data = await getRecentErrors(50)
    setErrors(data)
    setErrorsLoading(false)
  }, [])

  const loadFeedback = useCallback(async () => {
    setFeedbackLoading(true)
    const data = await getRecentFeedback(50)
    setFeedbackItems(data)
    setFeedbackLoading(false)
  }, [])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    clearUnread()
    loadErrors()
    loadFeedback()
  }, [loadErrors, loadFeedback])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setExpandedId(null)
    setShowNewForm(false)
    setNewBody('')
  }, [])

  const handleClearAllErrors = useCallback(async () => {
    await markAllResolved()
    setErrors([])
    setDbUnresolved(0)
  }, [])

  const handleSubmitFeedback = useCallback(async () => {
    if (!newBody.trim()) return
    setSubmitting(true)
    const ok = await saveFeedback(newCategory, newBody.trim(), pathname)
    if (ok) {
      setNewBody('')
      setShowNewForm(false)
      await loadFeedback()
    }
    setSubmitting(false)
  }, [newCategory, newBody, pathname, loadFeedback])

  const handleResolveFeedback = useCallback(async (id: string) => {
    await resolveFeedback(id)
    setFeedbackItems((prev) => prev.map((f) => f.id === id ? { ...f, resolved: true } : f))
  }, [])

  const handleDeleteFeedback = useCallback(async (id: string) => {
    await deleteFeedback(id)
    setFeedbackItems((prev) => prev.filter((f) => f.id !== id))
  }, [])

  if (pathname === '/login') return null

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
              padding: '16px 20px 0',
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
              Debug
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={tab === 'errors' ? loadErrors : loadFeedback}
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
              {tab === 'errors' && (
                <button
                  onClick={handleClearAllErrors}
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
              )}
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

          {/* Tab switcher */}
          <div
            style={{
              display: 'flex',
              gap: 0,
              padding: '12px 20px 0',
              borderBottom: `1px solid ${C.sand}`,
            }}
          >
            {([
              { id: 'errors' as Tab, label: 'Errors' },
              { id: 'feedback' as Tab, label: 'Feedback' },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: tab === t.id ? `3px solid ${C.charcoal}` : '3px solid transparent',
                  fontSize: 16,
                  fontWeight: tab === t.id ? 800 : 600,
                  color: tab === t.id ? C.charcoal : C.warmGray,
                  cursor: 'pointer',
                  fontFamily,
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 20px 24px',
            }}
          >
            {/* ═══════ ERRORS TAB ═══════ */}
            {tab === 'errors' && (
              <>
                {errorsLoading && errors.length === 0 && (
                  <p style={{ textAlign: 'center', color: C.warmGray, fontSize: 16, padding: '40px 0' }}>
                    Loading...
                  </p>
                )}

                {!errorsLoading && errors.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
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
                    <p style={{ fontSize: 18, fontWeight: 600, color: C.warmGray, margin: 0 }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
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
                        <span style={{ fontSize: 13, color: C.warmGray, fontWeight: 600 }}>
                          {err.created_at ? `${formatDate(err.created_at)} ${formatTime(err.created_at)}` : ''}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: C.charcoal }}>
                        {err.source}
                      </p>
                      <p style={{ margin: 0, fontSize: 14, color: C.warmGray, lineHeight: 1.4 }}>
                        {err.message}
                      </p>
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
              </>
            )}

            {/* ═══════ FEEDBACK TAB ═══════ */}
            {tab === 'feedback' && (
              <>
                {/* New feedback button / form */}
                {!showNewForm ? (
                  <button
                    onClick={() => setShowNewForm(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '14px 0',
                      background: C.charcoal,
                      color: C.white,
                      border: 'none',
                      borderRadius: 14,
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily,
                      marginBottom: 16,
                    }}
                  >
                    <Plus size={18} />
                    New Feedback
                  </button>
                ) : (
                  <div
                    style={{
                      background: C.white,
                      border: `2px solid ${C.sand}`,
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    {/* Category pills */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setNewCategory(cat.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 20,
                            border: newCategory === cat.id ? `2px solid ${cat.color}` : `2px solid ${C.sand}`,
                            background: newCategory === cat.id ? cat.color + '15' : C.white,
                            color: newCategory === cat.id ? cat.color : C.warmGray,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily,
                            transition: 'all 0.15s',
                          }}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Body textarea */}
                    <textarea
                      value={newBody}
                      onChange={(e) => setNewBody(e.target.value)}
                      placeholder="What did you notice?"
                      autoFocus
                      style={{
                        width: '100%',
                        minHeight: 80,
                        border: `2px solid ${C.sand}`,
                        borderRadius: 12,
                        padding: 12,
                        fontSize: 16,
                        fontFamily,
                        color: C.charcoal,
                        resize: 'vertical',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = categoryColor(newCategory) }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = C.sand }}
                    />

                    {/* Page auto-tag */}
                    <p style={{ fontSize: 12, color: C.warmGray, margin: '8px 0 12px', fontWeight: 600 }}>
                      Page: {pathname}
                    </p>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => { setShowNewForm(false); setNewBody('') }}
                        style={{
                          flex: 1,
                          padding: '12px 0',
                          background: C.white,
                          border: `2px solid ${C.sand}`,
                          borderRadius: 12,
                          fontSize: 15,
                          fontWeight: 700,
                          color: C.warmGray,
                          cursor: 'pointer',
                          fontFamily,
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitFeedback}
                        disabled={submitting || !newBody.trim()}
                        style={{
                          flex: 2,
                          padding: '12px 0',
                          background: categoryColor(newCategory),
                          border: 'none',
                          borderRadius: 12,
                          fontSize: 15,
                          fontWeight: 700,
                          color: C.white,
                          cursor: submitting ? 'wait' : 'pointer',
                          fontFamily,
                          opacity: submitting || !newBody.trim() ? 0.5 : 1,
                          transition: 'opacity 0.15s',
                        }}
                      >
                        {submitting ? 'Saving...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Feedback list */}
                {feedbackLoading && feedbackItems.length === 0 && (
                  <p style={{ textAlign: 'center', color: C.warmGray, fontSize: 16, padding: '40px 0' }}>
                    Loading...
                  </p>
                )}

                {!feedbackLoading && feedbackItems.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <p style={{ fontSize: 18, fontWeight: 600, color: C.warmGray, margin: 0 }}>
                      No feedback yet
                    </p>
                    <p style={{ fontSize: 14, color: C.warmGray, margin: '8px 0 0', opacity: 0.7 }}>
                      Tap &quot;New Feedback&quot; to log an observation
                    </p>
                  </div>
                )}

                {feedbackItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: C.white,
                      border: `2px solid ${item.resolved ? C.green + '30' : C.sand}`,
                      borderRadius: 16,
                      padding: '14px 16px',
                      marginBottom: 10,
                      opacity: item.resolved ? 0.6 : 1,
                    }}
                  >
                    {/* Top row: category + timestamp */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: categoryColor(item.category),
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          padding: '2px 8px',
                          background: categoryColor(item.category) + '12',
                          borderRadius: 6,
                        }}
                      >
                        {item.category}
                      </span>
                      <span style={{ fontSize: 13, color: C.warmGray, fontWeight: 600 }}>
                        {item.created_at ? `${formatDate(item.created_at)} ${formatTime(item.created_at)}` : ''}
                      </span>
                      {item.resolved && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.green, marginLeft: 'auto' }}>
                          Resolved
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: C.charcoal, lineHeight: 1.4 }}>
                      {item.body}
                    </p>

                    {/* Page + actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {item.page && (
                        <span style={{ fontSize: 12, color: C.warmGray, fontWeight: 600 }}>
                          {item.page}
                        </span>
                      )}
                      <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                        {!item.resolved && (
                          <button
                            onClick={() => handleResolveFeedback(item.id!)}
                            aria-label="Mark resolved"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: C.green + '15',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Check size={16} color={C.green} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteFeedback(item.id!)}
                          aria-label="Delete"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: C.red + '10',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} color={C.red} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
