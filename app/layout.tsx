import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Shell from './components/Shell'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const baseUrl = process.env.NEXTAUTH_URL || 'https://archive-downloader--sohamroychoudhu.replit.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Prowider — Lead Distribution System',
    template: '%s | Prowider',
  },
  description:
    'Prowider is a professional lead distribution and provider management platform. Submit service requests and get matched with the right providers instantly.',
  keywords: ['lead distribution', 'provider management', 'service requests', 'lead routing'],
  openGraph: {
    title: 'Prowider — Lead Distribution System',
    description:
      'Professional lead distribution platform. Route, manage, and track service leads across your provider network.',
    url: baseUrl,
    siteName: 'Prowider',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-slate-950 text-slate-100 antialiased flex flex-col">
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
