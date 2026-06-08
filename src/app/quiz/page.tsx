'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import questionsData from '@/data/questions.json'
import { supabase } from '@/lib/supabase'
import { getOrCreateSessionId } from '@/lib/utils'
import { ArrowLeft, ArrowRight, BookOpen, Check, Loader2, Trophy, RotateCcw, Volume2, Zap, Clock } from 'lucide-react'
import Link from 'next/link'
import { useSpeech } from '@/lib/useSpeech'
import ConfettiBurst from '@/components/effects/ConfettiBurst'
import { useWindowSize } from '@/hooks/useWindowSize'

type QuizQuestion = { id: string; question: string; answer: string; topicId: string; topicTitle: string; topicColor: string; topicIcon: string }
type Stage = 'select' | 'quiz' | 'review' | 'done'

export default function QuizPage() {
  const [stage, setStage] = useState<Stage>('select')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState(10)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [saving, setSaving] = useState(false)
  const [timer, setTimer] = useState(0)
  const [confettiTrigger, setConfettiTrigger] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const { width } = useWindowSize()
  const isMobile = width > 0 && width < 768

  const { isSpeaking, speak, stop } = useSpeech()

  useEffect(() => {
    return () => { stop(); if (timerRef.current) clearInterval(timerRef.current) }
  }, [stop])

  useEffect(() => {
    if (stage === 'quiz') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  }, [stage])

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const startQuiz = () => {
    const pool: QuizQuestion[] = []
    questionsData.topics
      .filter(t => selectedTopics.length === 0 || selectedTopics.includes(t.id))
      .forEach(t => {
        t.sections.forEach(s => {
          s.questions.forEach(q => {
            pool.push({ id: q.id, question: q.question, answer: q.answer, topicId: t.id, topicTitle: t.title, topicColor: t.color, topicIcon: t.icon })
          })
        })
      })
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, questionCount)
    setQuestions(shuffled)
    setAnswers({})
    setCurrentAnswer('')
    setCurrent(0)
    setTimer(0)
    setStage('quiz')
  }

  const saveAnswer = () => {
    if (!currentAnswer.trim()) return
    setAnswers(prev => ({ ...prev, [questions[current].id]: currentAnswer }))
    setCurrentAnswer('')
    if (current + 1 < questions.length) setCurrent(c => c + 1)
    else setStage('review')
  }

  const submitQuiz = async () => {
    setSaving(true)
    const sessionId = getOrCreateSessionId()
    const rows = questions.map(q => ({
      topic_id: q.topicId,
      topic_title: q.topicTitle,
      question_id: q.id,
      question_text: q.question,
      expected_answer: q.answer,
      user_answer: answers[q.id] || '(No answer provided)',
      session_id: sessionId,
    }))

    if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await supabase.from('quiz_attempts').insert(rows)
    } else {
      const existing = JSON.parse(localStorage.getItem('quiz_history') || '[]')
      localStorage.setItem('quiz_history', JSON.stringify([...existing, { date: new Date().toISOString(), rows }]))
    }

    setSaving(false)
    setConfettiTrigger(t => t + 1)
    setStage('done')
  }

  const q = questions[current]

  const btnFullWidth: React.CSSProperties = isMobile
    ? { width: '100%', padding: '16px' }
    : {}

  return (
    <main className="page-main">
      <ConfettiBurst trigger={confettiTrigger} />

      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 16px' }}>
        <AnimatePresence mode="wait">
          {/* SELECT */}
          {stage === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem', textDecoration: 'none', minHeight: 'auto' }}>
                <ArrowLeft size={14} /> Back
              </Link>

              <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 700, marginBottom: '0.75rem' }}>
                Quiz <span className="gradient-heading">Mode</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: isMobile ? '1rem' : '1.125rem' }}>Pick topics, set your count, and test yourself.</p>

              <div className="card" style={{ padding: isMobile ? '1.25rem' : '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: isMobile ? '0.9375rem' : '1rem' }}>
                  <BookOpen size={16} style={{ color: 'var(--accent)' }} />
                  Select Topics
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(empty = all)</span>
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {questionsData.topics.map(t => {
                    const selected = selectedTopics.includes(t.id)
                    return (
                      <motion.button
                        key={t.id}
                        whileTap={{ scale: 0.95 }}
                        animate={selected ? { scale: 1.05 } : { scale: 1 }}
                        onClick={() => setSelectedTopics(prev => prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id])}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: isMobile ? '8px 12px' : '10px 16px',
                          borderRadius: '100px', fontSize: isMobile ? '0.8125rem' : '0.875rem',
                          fontWeight: 600, cursor: 'pointer', border: selected ? 'none' : '1px solid var(--border)',
                          background: selected ? t.color : 'transparent',
                          color: selected ? 'white' : 'var(--text-secondary)',
                          boxShadow: selected ? `0 4px 16px ${t.color}40` : 'none',
                          minHeight: '44px',
                        }}
                      >
                        {t.icon} {t.title}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="card" style={{ padding: isMobile ? '1.25rem' : '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} style={{ color: '#fbbf24' }} />
                  Number of Questions
                </h3>
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  {[5, 10, 15, 20].map(n => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      style={{
                        flex: 1, padding: isMobile ? '14px 0' : '16px 0',
                        borderRadius: '100px', fontSize: '0.875rem', fontWeight: 700,
                        cursor: 'pointer', minHeight: '44px',
                        border: questionCount === n ? 'none' : '1px solid var(--border)',
                        background: questionCount === n ? 'var(--accent)' : 'transparent',
                        color: questionCount === n ? 'white' : 'var(--text-secondary)',
                        boxShadow: questionCount === n ? '0 4px 24px rgba(139,92,246,0.35)' : 'none',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={startQuiz} className="btn-primary" style={{ ...btnFullWidth, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1.125rem' }}>
                <Zap size={20} /> Start Quiz
              </button>
            </motion.div>
          )}

          {/* QUIZ */}
          {stage === 'quiz' && q && (
            <motion.div key={`q-${current}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ height: '4px', borderRadius: '100px', background: 'var(--border)', marginBottom: '2rem', overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', borderRadius: '100px', background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }}
                  animate={{ width: `${(current / questions.length) * 100}%` }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '6px 12px', borderRadius: '100px', background: `${q.topicColor}18`, color: q.topicColor }}>
                  {q.topicIcon} {q.topicTitle}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /><span style={{ fontFamily: 'monospace' }}>{formatTime(timer)}</span></span>
                  <span style={{ fontFamily: 'monospace' }}>{current + 1}/{questions.length}</span>
                </div>
              </div>

              <div className="card" style={{ padding: isMobile ? '1.25rem' : '2rem', marginBottom: '2rem', minHeight: isMobile ? '160px' : '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, lineHeight: 1.5, flex: 1 }}>{q.question}</h2>
                  <button
                    onClick={() => speak(q.question)}
                    style={{
                      width: '44px', height: '44px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '12px', cursor: 'pointer', minHeight: '44px',
                      border: isSpeaking ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: 'transparent',
                      color: isSpeaking ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                    className={isSpeaking ? 'now-playing' : ''}
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'block' }}>Your Answer</label>
                <textarea
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  style={{
                    width: '100%', background: 'transparent', color: 'var(--text-primary)',
                    outline: 'none', resize: 'none', lineHeight: 1.6,
                    minHeight: isMobile ? '200px' : '160px',
                    fontSize: isMobile ? '16px' : '1rem',
                    borderBottom: '2px solid var(--border)',
                    paddingBottom: '12px', fontFamily: 'var(--font-geist-mono), monospace',
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) saveAnswer() }}
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>⌘+Enter to save & next</span>
                  <span style={{ fontFamily: 'monospace' }}>{currentAnswer.length} chars</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                <button
                  onClick={() => {
                    setAnswers(prev => ({ ...prev, [q.id]: '' }))
                    if (current + 1 < questions.length) setCurrent(c => c + 1)
                    else setStage('review')
                    setCurrentAnswer('')
                  }}
                  style={{
                    ...btnFullWidth, flex: isMobile ? undefined : 1,
                    padding: '16px', borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-muted)',
                    fontSize: '0.875rem', cursor: 'pointer',
                  }}
                >
                  Skip
                </button>
                <button
                  onClick={saveAnswer}
                  disabled={!currentAnswer.trim()}
                  className="btn-primary"
                  style={{
                    ...btnFullWidth, flex: isMobile ? undefined : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontSize: '0.875rem', opacity: !currentAnswer.trim() ? 0.4 : 1,
                    cursor: !currentAnswer.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {current + 1 < questions.length ? <><ArrowRight size={16} /> Next</> : <><Check size={16} /> Finish</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* REVIEW */}
          {stage === 'review' && (
            <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2rem)', fontWeight: 700, marginBottom: '0.5rem' }}>
                Review <span className="gradient-heading">Answers</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Compare before saving.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '2rem' }}>
                {questions.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card"
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>Q{i + 1}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: `${q.topicColor}18`, color: q.topicColor }}>{q.topicTitle}</span>
                      </div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{q.question}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                      <div style={{ padding: '16px', borderBottom: isMobile ? '1px solid var(--border)' : 'none', borderRight: isMobile ? 'none' : '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>Expected Answer</p>
                        <p className="answer-prose" style={{ fontSize: '0.75rem' }}>{q.answer}</p>
                      </div>
                      <div style={{ padding: '16px' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', marginBottom: '8px' }}>Your Answer</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{answers[q.id] || '(skipped)'}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button onClick={submitQuiz} disabled={saving} className="btn-primary" style={{ ...btnFullWidth, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1.125rem', opacity: saving ? 0.6 : 1 }}>
                {saving ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : <><Check size={20} /> Save Attempt</>}
              </button>
            </motion.div>
          )}

          {/* DONE */}
          {stage === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: isMobile ? '48px 0' : '64px 0' }}>
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                style={{
                  width: '96px', height: '96px', borderRadius: '24px', margin: '0 auto 2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                  boxShadow: '0 16px 48px rgba(251,191,36,0.35)',
                }}
              >
                <Trophy size={44} style={{ color: 'white' }} />
              </motion.div>
              <h2 style={{ fontSize: 'clamp(2rem, 6vw, 2.5rem)', fontWeight: 700, marginBottom: '0.75rem' }}>
                Quiz <span className="gradient-heading">Complete!</span>
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? '24px' : '32px', margin: '24px 0 40px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--accent)' }}>{questions.length}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Questions</p>
                </div>
                <div>
                  <p style={{ fontSize: '1.875rem', fontWeight: 700, color: '#06b6d4', fontFamily: 'monospace' }}>{formatTime(timer)}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Time</p>
                </div>
                <div>
                  <p style={{ fontSize: '1.875rem', fontWeight: 700, color: '#10b981' }}>{Object.keys(answers).filter(k => answers[k]).length}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Answered</p>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#10b981', marginBottom: '2.5rem', fontWeight: 600 }}>✓ Answers saved successfully</p>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', justifyContent: 'center' }}>
                <button onClick={() => setStage('select')} className="btn-ghost" style={{ ...btnFullWidth, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <RotateCcw size={16} /> New Quiz
                </button>
                <Link href="/" className="btn-primary" style={{ ...btnFullWidth, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <ArrowLeft size={16} /> Back to Topics
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
