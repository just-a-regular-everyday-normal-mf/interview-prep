'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import questionsData from '@/data/questions.json'
import { ArrowRight, BookOpen, Mic, Brain, Target, Layers, Sparkles, Infinity } from 'lucide-react'
import HeroArt from '@/components/HeroArt'
import { useCountUp } from '@/lib/useCountUp'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { useWindowSize } from '@/hooks/useWindowSize'

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
}

function topicCardStyle(isMobile: boolean): React.CSSProperties {
  return {
    padding: isMobile ? '1.25rem' : '1.5rem',
    cursor: 'pointer',
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    height: '100%',
    minHeight: '120px',
  }
}

function StatChip({ icon: Icon, label, color }: { icon: typeof Layers; label: string; color: string }) {
  return (
    <div className="stat-chip" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Icon size={15} style={{ color }} />
      <span>{label}</span>
    </div>
  )
}

function AnimatedCount({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const count = useCountUp(value, 1400, inView)
  return <span ref={ref}>{count}{suffix}</span>
}

export default function Home() {
  const { width } = useWindowSize()
  const isMobile = width > 0 && width < 640

  const totalQuestions = questionsData.topics.reduce(
    (acc, t) => acc + t.sections.reduce((a, s) => a + s.questions.length, 0),
    0,
  )

  const features = [
    { icon: Mic, title: 'Read Aloud', desc: 'High-quality TTS with voice selection and speed control' },
    { icon: Brain, title: 'Quiz Mode', desc: 'Random questions with answer recording and review' },
    { icon: Target, title: 'Track Progress', desc: 'Bookmarks and completion tracking per topic' },
  ]

  return (
    <main className="page-main min-h-screen">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '90vh',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        <HeroArt />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '56rem', width: '100%' }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold"
            style={{
              fontSize: 'clamp(2rem, 7vw, 5rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}
          >
            Master Every
            <br />
            <span className="gradient-heading">Technical Interview</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              fontSize: '1.125rem',
              color: 'var(--text-secondary)',
              maxWidth: '42rem',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            Structured Q&As for Java, Spring, System Design, DSA and more.
            Study smarter with read-aloud, quizzes, and progress tracking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'center',
              marginBottom: '3rem',
              width: '100%',
              maxWidth: isMobile ? '320px' : 'none',
              margin: isMobile ? '0 auto 3rem' : undefined,
            }}
          >
            <Link href="#topics" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem', gap: '0.5rem', width: isMobile ? '100%' : 'auto' }}>
              Start Studying <ArrowRight size={18} />
            </Link>
            <Link href="/quiz" className="btn-ghost" style={{ padding: '1rem 2rem', fontSize: '1rem', gap: '0.5rem', width: isMobile ? '100%' : 'auto' }}>
              <BookOpen size={18} /> Take a Quiz
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}
          >
            <StatChip icon={Layers} label={`${questionsData.topics.length} Topics`} color="#8b5cf6" />
            <StatChip icon={Sparkles} label={`${totalQuestions}+ Questions`} color="#06b6d4" />
            <StatChip icon={Infinity} label="Free Forever" color="#10b981" />
          </motion.div>
        </div>
      </section>

      {/* Topics */}
      <section id="topics" style={{ padding: '6rem 0', maxWidth: '80rem', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '3.5rem', padding: '0 1rem' }}
        >
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Choose Your Battlefield 🔥
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Deep-dive into any area. Progress saves automatically.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: '1.25rem',
            padding: '0 1rem',
          }}
        >
          {questionsData.topics.map(topic => {
            const totalQ = topic.sections.reduce((a, s) => a + s.questions.length, 0)
            return (
              <motion.div key={topic.id} variants={cardVariants}>
                <Link href={`/topic/${topic.id}`} className="card" style={topicCardStyle(isMobile)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', marginBottom: '1rem', position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: topic.color,
                      opacity: 0.2,
                      filter: 'blur(20px)',
                    }} />
                    <span style={{ fontSize: '3rem', position: 'relative', zIndex: 1 }}>{topic.icon}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{topic.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {topic.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', background: `${topic.color}22`, color: topic.color }}>
                      <AnimatedCount value={totalQ} /> questions
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{topic.sections.length} sections</span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 1rem', maxWidth: '64rem', margin: '0 auto' }}>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{ textAlign: 'center', padding: '0 1rem' }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '16px', margin: '0 auto 1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--border)', background: 'var(--answer-bg)',
              }}>
                <f.icon size={22} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '2.5rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          InterviewPrep — Built for focused, persistent interview preparation.
        </p>
      </footer>
    </main>
  )
}
