const VOICE_PRIORITY = [
  'Google UK English Female',
  'Google US English',
  'Microsoft Aria Online (Natural)',
  'Microsoft Jenny Online (Natural)',
  'Samantha',
  'Karen',
  'Moira',
]

export function loadBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null
  const voices = window.speechSynthesis.getVoices()
  for (const name of VOICE_PRIORITY) {
    const v = voices.find(voice => voice.name === name)
    if (v) return v
  }
  const cloudEnglish = voices.find(v => v.lang.startsWith('en') && !v.localService)
  if (cloudEnglish) return cloudEnglish
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null
}

export function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined') return []
  return window.speechSynthesis.getVoices()
}

/** Format speech with natural pause: replace ? with ?, for TTS comma pause */
export function formatSpeechText(question: string, answer: string): string {
  const q = question.replace(/\?/g, '?,')
  return `Question: ${q}... ${answer}`
}

export function formatQuestionOnly(question: string): string {
  const q = question.replace(/\?/g, '?,')
  return `Question: ${q}`
}

export type SpeakOptions = {
  rate?: number
  voice?: SpeechSynthesisVoice | null
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
}

function applyVoice(
  utterance: SpeechSynthesisUtterance,
  voice: SpeechSynthesisVoice | null | undefined,
  rate: number,
) {
  utterance.pitch = 1
  utterance.volume = 1
  utterance.rate = rate
  utterance.lang = 'en-US'
  if (voice) utterance.voice = voice
}

export function speakQuestionAnswer(
  question: string,
  answer: string,
  options: SpeakOptions = {},
): () => void {
  const synth = window.speechSynthesis
  synth.cancel()
  const text = formatSpeechText(question, answer)
  const u = new SpeechSynthesisUtterance(text)
  applyVoice(u, options.voice, options.rate ?? 1.15)
  u.onstart = () => options.onStart?.()
  u.onend = () => options.onEnd?.()
  u.onerror = () => options.onError?.()
  synth.speak(u)
  return () => synth.cancel()
}

export function speakText(text: string, options: SpeakOptions = {}): () => void {
  const synth = window.speechSynthesis
  synth.cancel()
  const formatted = text.includes('Question:') ? text : formatQuestionOnly(text)
  const u = new SpeechSynthesisUtterance(formatted)
  applyVoice(u, options.voice, options.rate ?? 1.15)
  u.onstart = () => options.onStart?.()
  u.onend = () => options.onEnd?.()
  u.onerror = () => options.onError?.()
  synth.speak(u)
  return () => synth.cancel()
}

// Backwards compat alias
export const pickBestVoice = (_voices?: SpeechSynthesisVoice[]) => loadBestVoice()
