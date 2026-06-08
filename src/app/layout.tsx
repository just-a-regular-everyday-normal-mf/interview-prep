import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'InterviewPrep — Master Every Technical Interview',
  description: 'Structured Q&As for Java, Spring, System Design, DSA and more. Read aloud, quiz yourself, track progress.',
  keywords: 'java interview questions, spring boot, system design, dsa, docker kubernetes, devops',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="interviewprep-theme" themes={['light', 'dark']}>
          <Navbar />
          <div className="relative z-[1]">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
