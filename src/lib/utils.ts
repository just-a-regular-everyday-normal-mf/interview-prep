import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId()
  let id = localStorage.getItem('quiz_session_id')
  if (!id) {
    id = generateSessionId()
    localStorage.setItem('quiz_session_id', id)
  }
  return id
}
