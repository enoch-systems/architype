import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { BrandLoader } from '@/components/brand-loader'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Tech Skills Acquisition Program | Tech Trailblazer Academy',
  description: 'Build job-ready technology skills through paid, live training programs from Tech Trailblazer Academy.',
  icons: {
    icon: [{ url: 'https://res.cloudinary.com/djdbcoyot/image/upload/v1792461501/f71wqoiubyqksegyfftn.jpg', type: 'image/jpeg' }],
    apple: [{ url: 'https://res.cloudinary.com/djdbcoyot/image/upload/v1792461501/f71wqoiubyqksegyfftn.jpg', type: 'image/jpeg' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <BrandLoader />
      </body>
    </html>
  )
}
