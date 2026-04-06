import { Suspense } from 'react'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { EstablishmentList } from '@/components/cards/EstablishmentList'
import { SearchBar } from '@/components/ui/SearchBar'
import { ViewToggle } from '@/components/ui/ViewToggle'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    country?: string
    type?: string
    legalStatus?: string
    groupId?: string
    minBeds?: string
    maxBeds?: string
    signal?: string
    ownership?: string
    view?: 'list' | 'map'
    page?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const view = params.view ?? 'list'

  return (
    <div className="pt-14 h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex-none border-b border-gray-100 bg-white px-6 py-3 flex items-center gap-4">
        <Suspense fallback={<div className="flex-1 h-9 bg-gray-100 rounded-lg animate-pulse" />}>
          <SearchBar defaultValue={params.q} />
        </Suspense>
        <Suspense fallback={<div className="w-20 h-9 bg-gray-100 rounded-lg animate-pulse" />}>
          <ViewToggle current={view} />
        </Suspense>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar filters */}
        <aside className="flex-none w-72 border-r border-gray-100 bg-white overflow-y-auto p-4">
          <Suspense fallback={<div className="space-y-3">{Array.from({length: 6}).map((_,i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}</div>}>
            <FilterPanel searchParams={params} />
          </Suspense>
        </aside>

        {/* Results */}
        <div className="flex-1 overflow-y-auto bg-background">
          <Suspense fallback={<div className="p-6 space-y-3">{Array.from({length: 8}).map((_,i) => <div key={i} className="h-24 bg-white rounded-xl border border-gray-100 animate-pulse" />)}</div>}>
            <EstablishmentList searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
