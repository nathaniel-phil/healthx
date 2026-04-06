import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/ui/Navbar'

export const metadata: Metadata = {
  title: 'HealthMap — European Healthcare Intelligence',
  description: 'Find, filter and reach decision-makers across European healthcare establishments.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
