'use client'
import { use, useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import questionsData from '@/data/questions.json'
import {
  ArrowLeft, ChevronDown, ChevronUp, Volume2, VolumeX,
  Bookmark, BookmarkCheck, CheckCircle, Circle, Play, Pause,
  SkipForward, Radio,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useSpeech } from '@/lib/useSpeech'
import { useWindowSize } from '@/hooks/useWindowSize'
import SpeechSettingsPopover from '@/components/SpeechSettingsPopover'

type Question = { id: string; question: string; answer: string }

export default function TopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params)
  const topic = questionsData.topics.find(t => t.id === topicId)
  if (!topic) notFound()

  const { width } = useWindowSize()
  const isDesktop = width >= 1024
  const isMobile = width > 0 && width < 768

  const [openQuestion, setOpenQuestion] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [currentSpeakId, setCurrentSpeakId] = useState<string | null>(null)
  const [currentSpeakText, setCurrentSpeakText] = useState('')
  const [showRateControl, setShowRateControl] = useState(false)
  const [activeSection, setActiveSection] = useState(topic.sections[0]?.id)

  const [autoPlayActive, setAutoPlayActive] = useState(false)
  const autoPlayRef = useRef(false)
  const autoPlayQueueRef = useRef<Question[]>([])
  const autoPlayIndexRef = useRef(0)
  const pillBarRef = useRef<HTMLDivElement>(null)

  const {
    voices, selectedVoice, selectVoice,
    speechRate, setSpeechRate,
    isSpeaking, speakQA, stop,
  } = useSpeech()

  useEffect(() => {
    const saved = localStorage.getItem(`bookmarks_${topicId}`)
    if (saved) setBookmarks(new Set(JSON.parse(saved)))
    const savedCompleted = localStorage.getItem(`completed_${topicId}`)
    if (savedCompleted) setCompleted(new Set(JSON.parse(savedCompleted)))
    return () => stop()
  }, [topicId, stop])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    topic.sections.forEach(section => {
      const el = document.getElementById(`section-${section.id}`)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(section.id) },
        { rootMargin: '-30% 0px -60% 0px' },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [topic.sections])

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const speak = useCallback((question: Question, onEnd?: () => void) => {
    setCurrentSpeakId(question.id)
    setCurrentSpeakText(question.question)
    setOpenQuestion(question.id)
    speakQA(question.question, question.answer, () => {
      setCurrentSpeakId(null)
      setCurrentSpeakText('')
      onEnd?.()
    })
  }, [speakQA])

  const stopSpeaking = () => {
    stop()
    setCurrentSpeakId(null)
    setCurrentSpeakText('')
    autoPlayRef.current = false
    setAutoPlayActive(false)
  }

  const startAutoPlay = (sectionId: string) => {
    const section = topic.sections.find(s => s.id === sectionId)
    if (!section) return
    autoPlayRef.current = true
    setAutoPlayActive(true)
    autoPlayQueueRef.current = section.questions
    autoPlayIndexRef.current = 0

    const playNext = (index: number) => {
      if (!autoPlayRef.current || index >= autoPlayQueueRef.current.length) {
        autoPlayRef.current = false
        setAutoPlayActive(false)
        return
      }
      const q = autoPlayQueueRef.current[index]
      speak(q, () => {
        autoPlayIndexRef.current = index + 1
        setTimeout(() => playNext(index + 1), 1000)
      })
    }
    playNext(0)
  }

  const skipToNext = () => {
    if (!autoPlayRef.current) return
    stop()
    const next = autoPlayIndexRef.current + 1
    if (next < autoPlayQueueRef.current.length) {
      autoPlayIndexRef.current = next
      setTimeout(() => {
        const playNext = (index: number) => {
          if (!autoPlayRef.current || index >= autoPlayQueueRef.current.length) {
            autoPlayRef.current = false
            setAutoPlayActive(false)
            return
          }
          const q = autoPlayQueueRef.current[index]
          speak(q, () => {
            autoPlayIndexRef.current = index + 1
            setTimeout(() => playNext(index + 1), 1000)
          })
        }
        playNext(next)
      }, 200)
    } else {
      autoPlayRef.current = false
      setAutoPlayActive(false)
    }
  }

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem(`bookmarks_${topicId}`, JSON.stringify([...next]))
      return next
    })
  }

  const toggleCompleted = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem(`completed_${topicId}`, JSON.stringify([...next]))
      return next
    })
  }

  const totalQ = topic.sections.reduce((a, s) => a + s.questions.length, 0)
  const completedCount = completed.size
  const progressPct = Math.round((completedCount / totalQ) * 100)

  const iconBtnSize = isMobile ? 28 : 32
  const iconSize = isMobile ? 14 : 16

  const sectionPills = topic.sections.map(section => {
    const done = section.questions.filter(q => completed.has(q.id)).length
    const isActive = activeSection === section.id
    return (
      <button
        key={section.id}
        onClick={() => scrollToSection(section.id)}
        style={{
          flexShrink: 0,
          padding: '8px 14px',
          borderRadius: '100px',
          fontSize: '0.8125rem',
          fontWeight: isActive ? 600 : 500,
          cursor: 'pointer',
          border: isActive ? `1px solid ${topic.color}88` : '1px solid var(--border-subtle)',
          background: isActive ? `${topic.color}33` : 'var(--bg-pill)',
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          whiteSpace: 'nowrap',
        }}
      >
        {section.title}
        <span style={{ marginLeft: '6px', fontSize: '10px', fontFamily: 'monospace', opacity: 0.7 }}>
          {done}/{section.questions.length}
        </span>
      </button>
    )
  })

  return (
    <main className="page-main">
      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: '64px',
          zIndex: 40,
          padding: isMobile ? '10px 12px' : '12px 16px',
          backgroundColor: 'var(--navbar-bg)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{
          maxWidth: '72rem', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '12px', flexWrap: 'nowrap', overflow: 'visible',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', display: 'flex', flexShrink: 0, minHeight: 'auto' }}>
              <ArrowLeft size={16} />
            </Link>
            <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{topic.icon}</span>
            <span style={{
              fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', minWidth: 0,
            }}>
              {topic.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {/* Progress bar — always show strip; hide count text on mobile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                height: '6px',
                width: isMobile ? '48px' : '112px',
                borderRadius: '100px',
                background: 'var(--border-subtle)',
                overflow: 'hidden',
              }}>
                <motion.div
                  style={{ height: '100%', borderRadius: '100px', background: topic.color }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              {!isMobile && (
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  {completedCount}/{totalQ}
                </span>
              )}
            </div>

            <SpeechSettingsPopover
              open={showRateControl}
              onOpenChange={setShowRateControl}
              speechRate={speechRate}
              onRateChange={setSpeechRate}
              voices={voices}
              selectedVoice={selectedVoice}
              onVoiceSelect={selectVoice}
              compact={isMobile}
            />
          </div>
        </div>
      </div>

      {/* Mobile/Tablet horizontal section pills */}
      {!isDesktop && (
        <div
          ref={pillBarRef}
          className="scroll-hide section-pill-bar"
          style={{
            position: 'sticky',
            top: isMobile ? '118px' : '120px',
            zIndex: 35,
            display: 'flex',
            gap: '8px',
            padding: '12px 16px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            backdropFilter: 'blur(16px)',
          }}
        >
          {sectionPills}
        </div>
      )}

      <div style={{
        maxWidth: '72rem', margin: '0 auto',
        padding: isMobile ? '20px 12px' : '32px 16px',
        display: 'flex', gap: '24px',
      }}>
        {/* Desktop sidebar */}
        {isDesktop && (
          <aside style={{ width: '224px', flexShrink: 0 }}>
            <div className="card" style={{ position: 'sticky', top: '148px', padding: '12px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0 8px', marginBottom: '12px' }}>Sections</p>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {topic.sections.map(section => {
                  const done = section.questions.filter(q => completed.has(q.id)).length
                  const isActive = activeSection === section.id
                  return (
                    <a
                      key={section.id}
                      href={`#section-${section.id}`}
                      onClick={e => { e.preventDefault(); scrollToSection(section.id) }}
                      className={isActive ? 'sidebar-pill sidebar-pill--active' : 'sidebar-pill'}
                      style={isActive ? { background: `${topic.color}33`, borderLeftColor: topic.color } : undefined}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{section.title}</span>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', marginLeft: '8px', flexShrink: 0 }}>{done}/{section.questions.length}</span>
                    </a>
                  )
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {topic.sections.map(section => (
            <section key={section.id} id={`section-${section.id}`} style={{ marginBottom: isMobile ? '40px' : '56px', scrollMarginTop: isDesktop ? '148px' : '170px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '16px' : '24px', gap: '12px' }}>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{section.title}</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{section.questions.length} questions</p>
                </div>
                <button
                  onClick={() => startAutoPlay(section.id)}
                  aria-label="Play section"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: isMobile ? '10px' : '8px 16px',
                    borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    background: `${topic.color}22`, border: `1px solid ${topic.color}55`, color: topic.color,
                    flexShrink: 0, minWidth: isMobile ? '44px' : 'auto', minHeight: '44px',
                  }}
                >
                  <Play size={isMobile ? 14 : 12} />
                  {!isMobile && 'Play Section'}
                </button>
              </div>

              <div>
                {section.questions.map((q, qIdx) => {
                  const isOpen = openQuestion === q.id
                  const isPlaying = currentSpeakId === q.id
                  const isDone = completed.has(q.id)

                  return (
                    <motion.div
                      key={q.id}
                      id={q.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: qIdx * 0.04, duration: 0.4 }}
                      className={isPlaying ? 'now-playing' : ''}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        marginBottom: '0.75rem',
                        overflow: 'hidden',
                        borderLeft: `3px solid ${topic.color}`,
                        opacity: isDone ? 0.65 : 1,
                      }}
                    >
                      <div style={{ padding: isMobile ? '1rem' : '1.25rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: isMobile ? '10px' : '16px',
                          flexWrap: 'wrap',
                        }}>
                          <motion.button
                            onClick={() => toggleCompleted(q.id)}
                            whileTap={{ scale: 1.3 }}
                            style={{ marginTop: '2px', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto' }}
                            aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {isDone
                              ? <CheckCircle size={isMobile ? 18 : 20} style={{ color: '#10b981' }} />
                              : <Circle size={isMobile ? 18 : 20} style={{ color: 'var(--text-muted)' }} />}
                          </motion.button>

                          <button
                            style={{ flex: '1 1 60%', minWidth: '120px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto' }}
                            onClick={() => setOpenQuestion(isOpen ? null : q.id)}
                          >
                            <motion.span
                              style={{
                                fontSize: 'clamp(0.85rem, 2.5vw, 0.9375rem)',
                                fontWeight: 600,
                                color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                                lineHeight: 1.6,
                                display: 'block',
                              }}
                              animate={isDone ? { textDecoration: 'line-through' } : { textDecoration: 'none' }}
                              transition={{ duration: 0.3 }}
                            >
                              {q.question}
                            </motion.span>
                          </button>

                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '2px',
                            flexShrink: 0, marginLeft: 'auto',
                            flexWrap: 'nowrap',
                          }}>
                            {isPlaying && !isMobile && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-bg)', padding: '4px 8px', borderRadius: '100px', marginRight: '4px' }}>
                                <Radio size={10} /> Now Playing
                              </span>
                            )}
                            <button onClick={() => toggleBookmark(q.id)} style={{ width: iconBtnSize, height: iconBtnSize, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }} aria-label="Bookmark">
                              {bookmarks.has(q.id) ? <BookmarkCheck size={iconSize} style={{ color: '#fbbf24' }} /> : <Bookmark size={iconSize} style={{ color: 'var(--text-muted)' }} />}
                            </button>
                            <button
                              onClick={() => { if (isPlaying && isSpeaking) stopSpeaking(); else speak(q) }}
                              style={{ width: iconBtnSize, height: iconBtnSize, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: isPlaying ? 'var(--accent)' : 'var(--text-muted)', minHeight: 'auto' }}
                              aria-label="Read aloud"
                            >
                              {isPlaying ? <VolumeX size={iconSize} /> : <Volume2 size={iconSize} />}
                            </button>
                            <button onClick={() => setOpenQuestion(isOpen ? null : q.id)} style={{ width: iconBtnSize, height: iconBtnSize, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', minHeight: 'auto' }}>
                              {isOpen ? <ChevronUp size={iconSize} /> : <ChevronDown size={iconSize} />}
                            </button>
                          </div>
                        </div>
                        {isPlaying && isMobile && (
                          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--accent)' }}>
                            <Radio size={10} /> Now Playing
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{
                              padding: isMobile ? '16px' : '1rem 1.5rem',
                              background: 'var(--answer-bg)',
                              borderTop: '1px solid var(--border-subtle)',
                              lineHeight: 1.8,
                              fontSize: '0.9rem',
                              color: 'var(--text-secondary)',
                            }}>
                              <p className="answer-prose" style={{ margin: 0 }}>{q.answer}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* TTS player */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            style={{
              position: 'fixed', bottom: isMobile ? '12px' : '24px',
              left: '50%', transform: 'translateX(-50%)',
              zIndex: 50, width: 'calc(100% - 1rem)', maxWidth: '36rem',
            }}
          >
            <div className="tts-player" style={{ padding: isMobile ? '12px 14px' : '14px 20px', display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '20px', flexShrink: 0 }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="waveform-bar" />)}
              </div>
              <p style={{ flex: 1, fontSize: isMobile ? '0.8125rem' : '0.875rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, margin: 0 }}>
                {currentSpeakText || 'Reading aloud...'}
              </p>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', flexShrink: 0 }}>{speechRate}x</span>
              {autoPlayActive && (
                <button onClick={skipToNext} style={{ width: iconBtnSize, height: iconBtnSize, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', minHeight: 'auto' }} aria-label="Skip">
                  <SkipForward size={14} />
                </button>
              )}
              <button
                onClick={stopSpeaking}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'var(--accent-bg)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer', minHeight: 'auto' }}
              >
                <Pause size={12} /> {!isMobile && 'Stop'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}
