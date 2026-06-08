import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type QuizAttempt = {
  id?: string
  topic_id: string
  topic_title: string
  question_id: string
  question_text: string
  expected_answer: string
  user_answer: string
  created_at?: string
  session_id: string
}
