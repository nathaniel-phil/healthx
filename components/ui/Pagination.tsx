'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  total: number
  pageSize: number
  searchParams: Record<string, string | undefined>
}

export function Pagination({ page, total, pageSize, searchParams }: Props) {
  const pathname = usePathname()
  const totalPages = Math.ceil(total / pageSize)

  const href = (p: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
    )
    params.set('page', String(p))
    return `${pathname}?${params.toString()}`
  }

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1
    if (page <= 4) return i + 1
    if (page >= totalPages - 3) return totalPages - 6 + i
    return page - 3 + i
  })

  return (
    <div className="flex items-center justify-center gap-1">
      <Link
        href={href(page - 1)}
        className={clsx('btn-secondary p-2', page <= 1 && 'pointer-events-none opacity-40')}
      >
        <ChevronLeft size={16} />
      </Link>

      {pages.map(p => (
        <Link
          key={p}
          href={href(p)}
          className={clsx(
            'w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors',
            p === page
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          {p}
        </Link>
      ))}

      <Link
        href={href(page + 1)}
        className={clsx('btn-secondary p-2', page >= totalPages && 'pointer-events-none opacity-40')}
      >
        <ChevronRight size={16} />
      </Link>
    </div>
  )
}
