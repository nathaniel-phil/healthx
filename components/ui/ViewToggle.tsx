'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { List, Columns2, Map } from 'lucide-react'
import { clsx } from 'clsx'

export function ViewToggle({ current }: { current: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const href = (view: string) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set('view', view)
    return `${pathname}?${p.toString()}`
  }

  return (
    <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
      {[
        { view: 'list',  Icon: List,     label: 'List' },
        { view: 'split', Icon: Columns2, label: 'Split' },
        { view: 'map',   Icon: Map,      label: 'Map' },
      ].map(({ view, Icon, label }) => (
        <Link
          key={view}
          href={href(view)}
          title={label}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 text-sm transition-colors',
            current === view
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          <Icon size={15} />
          <span className="hidden sm:inline">{label}</span>
        </Link>
      ))}
    </div>
  )
}
