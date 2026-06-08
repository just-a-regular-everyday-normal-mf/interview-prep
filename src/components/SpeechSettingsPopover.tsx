'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings2 } from 'lucide-react'

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

type SpeechSettingsPopoverProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  speechRate: number
  onRateChange: (rate: number) => void
  voices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null | undefined
  onVoiceSelect: (voice: SpeechSynthesisVoice) => void
  compact?: boolean
}

export default function SpeechSettingsPopover({
  open,
  onOpenChange,
  speechRate,
  onRateChange,
  voices,
  selectedVoice,
  onVoiceSelect,
  compact,
}: SpeechSettingsPopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const englishVoices = voices.filter(v => v.lang.startsWith('en'))

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onOpenChange])

  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 100 }}>
      <button
        type="button"
        onClick={e => {
          e.stopPropagation()
          onOpenChange(!open)
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '6px 10px' : '6px 12px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          fontSize: '0.75rem',
          cursor: 'pointer',
          minHeight: '44px',
        }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Settings2 size={13} />
        <span style={{ fontFamily: 'monospace' }}>{speechRate}x</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="card settings-popover"
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Speech Rate
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: englishVoices.length > 0 ? '16px' : 0 }}>
              {RATES.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    onRateChange(r)
                    onOpenChange(false)
                  }}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    border: 'none',
                    cursor: 'pointer',
                    minHeight: '36px',
                    background: speechRate === r ? 'var(--accent-bg)' : 'transparent',
                    color: speechRate === r ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {r}x
                </button>
              ))}
            </div>

            {englishVoices.length > 0 && (
              <>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Voice
                </p>
                <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                  {englishVoices.slice(0, 12).map(v => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        onVoiceSelect(v)
                        onOpenChange(false)
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 8px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        border: 'none',
                        cursor: 'pointer',
                        minHeight: '36px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        background: selectedVoice?.name === v.name ? 'var(--accent-bg)' : 'transparent',
                        color: selectedVoice?.name === v.name ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                    >
                      {v.name.replace(/Microsoft |Google /g, '')}
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
