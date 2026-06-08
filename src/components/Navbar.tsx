'use client'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Search, BookOpen, X, Menu } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import questionsData from '@/data/questions.json'
import Logo from '@/components/Logo'
import { useWindowSize } from '@/hooks/useWindowSize'

const NAV_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '64px',
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  backgroundColor: 'var(--navbar-bg)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid var(--border-color)',
  transition: 'background-color 0.3s ease, border-color 0.3s ease',
}

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ topicId: string; topicTitle: string; question: string; id: string }>>([])
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])
  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const q = searchQuery.toLowerCase()
    const results: typeof searchResults = []
    questionsData.topics.forEach(topic => {
      topic.sections.forEach(section => {
        section.questions.forEach(question => {
          if (question.question.toLowerCase().includes(q) || question.answer.toLowerCase().includes(q)) {
            results.push({ topicId: topic.id, topicTitle: topic.title, question: question.question, id: question.id })
          }
        })
      })
    })
    setSearchResults(results.slice(0, 8))
  }, [searchQuery])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
      if (e.key === 'Escape') { setSearchOpen(false); setMobileOpen(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const openSearch = () => setSearchOpen(true)
  const { width } = useWindowSize()
  const isMobile = width > 0 && width < 640

  return (
    <>
      <nav style={NAV_STYLE}>
        {/* Left: Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0, minHeight: 'auto' }}>
          <Logo size={isMobile ? 30 : 34} />
          <span style={{ fontWeight: 700, fontSize: isMobile ? '0.9rem' : '15px', letterSpacing: '-0.02em' }}>
            {isMobile ? (
              <><span style={{ color: 'var(--text-primary)' }}>IP</span></>
            ) : (
              <><span style={{ color: 'var(--text-primary)' }}>Interview</span><span className="brand-prep">Prep</span></>
            )}
          </span>
        </Link>

        {/* Center: Search (desktop) */}
        <button
          onClick={openSearch}
          className="search-pill hidden md:flex"
          style={{
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            flex: 1,
            maxWidth: '28rem',
            margin: '0 1rem',
            fontSize: '0.875rem',
            border: 'none',
            width: 'auto',
          }}
        >
          <Search size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search 300+ questions...</span>
          <kbd style={{
            fontSize: '10px', fontFamily: 'monospace', padding: '2px 6px',
            borderRadius: '6px', background: 'var(--accent-bg)',
            border: '1px solid var(--border)', color: 'var(--text-secondary)',
          }}>⌘K</kbd>
        </button>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={openSearch}
            className="md:hidden"
            style={{
              width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent',
              color: 'var(--text-secondary)', cursor: 'pointer', minHeight: '44px',
            }}
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          <Link
            href="/quiz"
            className="btn-quiz sm:hidden"
            style={{
              width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, minHeight: '44px',
            }}
            aria-label="Quiz"
          >
            <BookOpen size={18} />
          </Link>
          <Link
            href="/quiz"
            className="btn-quiz hidden sm:flex"
            style={{ padding: '8px 16px', fontSize: '0.875rem', minHeight: '44px' }}
          >
            <BookOpen size={14} />
            Quiz
          </Link>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer', minHeight: '44px',
              }}
              aria-label="Toggle theme"
            >
              <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </motion.div>
            </button>
          )}

          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden"
            style={{
              width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent',
              color: 'var(--text-secondary)', cursor: 'pointer', minHeight: '44px',
            }}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-menu-overlay"
            style={{
              position: 'fixed', inset: 0, zIndex: 90,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px',
            }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute', top: '20px', right: '16px',
                width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
            <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 700, textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
              <span style={{ color: 'var(--text-primary)' }}>Interview</span>
              <span className="brand-prep">Prep</span>
            </Link>
            {[
              { href: '/', label: 'Home' },
              { href: '/quiz', label: 'Take a Quiz' },
              { href: '/#topics', label: 'Browse Topics' },
            ].map((item, i) => (
              <motion.div key={item.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link href={item.href} onClick={() => setMobileOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              </motion.div>
            ))}
            <button
              onClick={() => { setMobileOpen(false); openSearch() }}
              className="search-pill"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', fontSize: '0.875rem', border: 'none' }}
            >
              <Search size={15} /> Search questions...
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              display: 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', justifyContent: 'center',
              paddingTop: isMobile ? 0 : '6rem',
              padding: isMobile ? 0 : '6rem 1rem 1rem',
            }}
            onClick={() => setSearchOpen(false)}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
            <motion.div
              initial={{ opacity: 0, y: isMobile ? 0 : -16, scale: isMobile ? 1 : 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: isMobile ? 0 : -8 }}
              className="card"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: isMobile ? '100%' : '42rem',
                overflow: 'hidden',
                borderRadius: isMobile ? 0 : undefined,
                minHeight: isMobile ? '100vh' : undefined,
                marginTop: isMobile ? 0 : undefined,
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <Search size={18} style={{ color: 'var(--accent)' }} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search any question or answer..."
                  style={{ flex: 1, background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', border: 'none' }}
                />
                <button onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
              {searchResults.length > 0 && (
                <div style={{ maxHeight: '24rem', overflowY: 'auto', padding: '8px' }}>
                  {searchResults.map((result, i) => (
                    <motion.button
                      key={result.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => { router.push(`/topic/${result.topicId}#${result.id}`); setSearchOpen(false); setSearchQuery('') }}
                      style={{
                        width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: '12px',
                        background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '4px' }}>{result.topicTitle}</div>
                      <div style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>{result.question}</div>
                    </motion.button>
                  ))}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No questions found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
