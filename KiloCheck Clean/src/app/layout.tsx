import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SecurityProvider } from '@/components/SecurityProvider'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true
})

export const metadata: Metadata = {
  title: 'KiloCheck - Precio Unitario Inteligente',
  description: 'Calcula el precio por kilogramo o litro de productos mediante análisis inteligente de fotografías de etiquetas.',
  keywords: ['precio unitario', 'supermercado', 'comparación precios', 'IA', 'análisis imágenes'],
  authors: [{ name: 'KiloCheck Team' }],
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: '#3b82f6',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KiloCheck',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'KiloCheck',
    title: 'KiloCheck - Precio Unitario Inteligente',
    description: 'Calcula el precio por kilogramo o litro de productos mediante análisis inteligente de fotografías.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KiloCheck - Análisis de Precios Unitarios',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KiloCheck - Precio Unitario Inteligente',
    description: 'Calcula el precio por kilogramo o litro de productos mediante análisis inteligente de fotografías.',
    images: ['/og-image.png'],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* PWA Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KiloCheck" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3b82f6" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/manifest.json" as="fetch" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <SecurityProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right">
            {children}
          </div>
        </SecurityProvider>
      </body>
    </html>
  )
}