import Link from 'next/link'
import Logo from '@/components/Logo'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="text-center">
        <div className="flex justify-center mb-8"><Logo size={56} /></div>
        <h1 className="text-6xl font-bold mb-4 gradient-heading">404</h1>
        <p className="text-[var(--text-secondary)] mb-10 text-lg">This page doesn&apos;t exist.</p>
        <Link href="/" className="btn-primary inline-flex px-8 py-3.5">
          Back to InterviewPrep
        </Link>
      </div>
    </main>
  )
}
