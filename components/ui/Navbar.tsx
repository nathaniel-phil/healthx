'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const NAV_LINKS = [
  { href: '/search',    label: 'Search' },
  { href: '/graph',     label: 'Graph' },
  { href: '/signals',   label: 'Signals' },
  { href: '/market',    label: 'Market' },
  { href: '/pricing',   label: 'Pricing' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-serif font-bold text-xl text-gray-900">
          HealthMap
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname === l.href
                  ? 'text-primary bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="btn-secondary text-sm py-1.5">
            Dashboard
          </Link>
          <Link href="/search" className="btn-primary text-sm py-1.5">
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
