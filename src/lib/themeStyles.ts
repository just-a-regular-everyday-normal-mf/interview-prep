import type { CSSProperties } from 'react'

/** Shared layout styles that respect CSS theme variables */
export const pageMain: CSSProperties = {
  minHeight: '100vh',
  paddingTop: '64px',
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
}

export const stickyBar: CSSProperties = {
  backgroundColor: 'var(--navbar-bg)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid var(--border-color)',
}

export const navBar: CSSProperties = {
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
}

export const questionCard: CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '16px',
  marginBottom: '0.75rem',
  overflow: 'hidden',
}

export const answerPanel: CSSProperties = {
  padding: '1rem 1.5rem',
  background: 'var(--answer-bg)',
  borderTop: '1px solid var(--border-subtle)',
  lineHeight: 1.8,
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
}

export const topicCard: CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '20px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
  height: '100%',
  minHeight: '120px',
  boxShadow: 'var(--card-shadow)',
}
