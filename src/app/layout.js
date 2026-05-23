import { Geist } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { Analytics } from '@vercel/analytics/react'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata = {
  title: 'AltSignals — Professional Trading Signals & Fund Management',
  description: 'AltSignals is a premier trading signals and fund management platform offering institutional-grade copy trading, VIP signals, trading challenges and wealth growth for serious traders worldwide.',
  keywords: 'AltSignals, trading signals, copy trading, fund management, crypto trading, forex signals, VIP trading, trading challenges, altcoin signals',
  metadataBase: new URL('https://altsignals.finance'),
  alternates: {
    canonical: 'https://altsignals.finance',
  },
  openGraph: {
    title: 'AltSignals — Professional Trading Signals & Fund Management',
    description: 'Institutional-grade trading signals, copy trading and fund management for serious traders.',
    url: 'https://altsignals.finance',
    siteName: 'AltSignals',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://altsignals.finance/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AltSignals — Professional Trading Signals',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AltSignals — Professional Trading Signals & Fund Management',
    description: 'Institutional-grade trading signals, copy trading and fund management for serious traders.',
    images: ['https://altsignals.finance/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FinancialService',
              name: 'AltSignals',
              description: 'Professional trading signals and fund management platform offering copy trading, VIP signals and trading challenges.',
              url: 'https://altsignals.finance',
              foundingDate: '2019',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'London',
                addressCountry: 'GB'
              },
              sameAs: ['https://altsignals.finance', 'https://altsignals.io'],
              offers: {
                '@type': 'Offer',
                description: 'Fund management plans starting from $2,000 with consistent weekly returns'
              }
            })
          }}
        />
      </head>
      <body className={geist.variable}>
        <AuthProvider>
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}