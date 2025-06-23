import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from './contexts/AppContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'iCSS - CSS 奇技淫巧',
  description: 'CSS 奇技淫巧，在这里，都有。本 Repo 围绕 CSS/Web动画 展开，谈一些有趣的话题，内容天马行空，想到什么说什么。',
  keywords: 'CSS, 动画, 前端, 技巧, 奇技淫巧',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta 
          httpEquiv="Permissions-Policy" 
          content="camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), serial=(), xr-spatial-tracking=(), clipboard-read=(), clipboard-write=(), web-share=(), display-capture=(), bluetooth=(), midi=(), encrypted-media=()"
        />
      </head>
      <body className={`${inter.className} transition-colors duration-200`}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
} 