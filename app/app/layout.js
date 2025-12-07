import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'NBA Futuristic 2025',
  description: 'The dopest live NBA stats & news site on the planet',
}

export default function RootLayout({ children }) {
  {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
