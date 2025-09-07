import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { HydrationFix } from '@/components/HydrationFix'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Formify - Smart Form Builder with AI',
  description: 'Build intelligent forms with AI-powered validation and drag-and-drop interface',
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/logo.svg',
    apple: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <HydrationFix>
          <ThemeProvider>
            <div className="min-h-screen bg-background text-foreground">
              {children}
            </div>
          </ThemeProvider>
        </HydrationFix>
      </body>
    </html>
  )
}
