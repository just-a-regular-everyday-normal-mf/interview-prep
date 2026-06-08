'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { loadBestVoice, loadVoices, speakQuestionAnswer, speakText } from './speech'

const VOICE_STORAGE_KEY = 'interviewprep-voice'

export function useSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [speechRate, setSpeechRate] = useState(1)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const bestVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const update = () => {
      const loaded = loadVoices()
      if (!loaded.length) return
      setVoices(loaded)
      bestVoiceRef.current = loadBestVoice()
      const saved = localStorage.getItem(VOICE_STORAGE_KEY)
      const savedVoice = saved ? loaded.find(v => v.name === saved) : null
      setSelectedVoice(savedVoice ?? bestVoiceRef.current)
    }
    update()
    window.speechSynthesis.onvoiceschanged = update
    return () => {
      window.speechSynthesis.onvoiceschanged = null
      cleanupRef.current?.()
      window.speechSynthesis.cancel()
    }
  }, [])

  const selectVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice)
    bestVoiceRef.current = voice
    localStorage.setItem(VOICE_STORAGE_KEY, voice.name)
  }, [])

  const stop = useCallback(() => {
    cleanupRef.current?.()
    cleanupRef.current = null
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const activeVoice = selectedVoice ?? bestVoiceRef.current

  const speakQA = useCallback((question: string, answer: string, onEnd?: () => void) => {
    stop()
    cleanupRef.current = speakQuestionAnswer(question, answer, {
      rate: speechRate,
      voice: activeVoice,
      onStart: () => setIsSpeaking(true),
      onEnd: () => { setIsSpeaking(false); onEnd?.() },
      onError: () => setIsSpeaking(false),
    })
  }, [speechRate, activeVoice, stop])

  const speak = useCallback((text: string) => {
    if (isSpeaking) { stop(); return }
    cleanupRef.current = speakText(text, {
      rate: speechRate,
      voice: activeVoice,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    })
  }, [isSpeaking, speechRate, activeVoice, stop])

  return {
    voices,
    selectedVoice: activeVoice,
    selectVoice,
    speechRate,
    setSpeechRate,
    isSpeaking,
    speakQA,
    speak,
    stop,
  }
}
