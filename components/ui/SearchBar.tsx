'use client'

import { Search } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(defaultValue ?? '')

  const submit = useCallback((q: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname])

  return (
    <form
      className="flex-1 relative"
      onSubmit={e => { e.preventDefault(); submit(value) }}
    >
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        className="input pl-9 pr-4 py-2"
        placeholder="Search by name, city, group…"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
    </form>
  )
}
