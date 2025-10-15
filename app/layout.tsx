/**
 * app/layout.tsx
 * Root layout component for the Flux application.
 * Provides the base HTML structure and global styles.
 */
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Flux',
  description: 'Built with Next.js and Supabase',
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
