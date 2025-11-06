import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CryptoBuddy - Crypto Tax Platform',
  description: 'Multi-user crypto tax platform for German tax law',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="font-sans">{children}</body>
    </html>
  )
}
