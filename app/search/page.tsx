import { FilterPanel } from '@/components/filters/FilterPanel'
import { EstablishmentList } from '@/components/cards/EstablishmentList'
import { SearchBar } from '@/components/ui/SearchBar'
import { ViewToggle } from '@/components/ui/ViewToggle'

interface SearchPageProps {
  searchParams: {
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
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const view = searchParams.view ?? 'list'

  return (
    <div className="pt-14 h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex-none border-b border-gray-100 bg-white px-6 py-3 flex items-center gap-4">
        <SearchBar defaultValue={searchParams.q} />
        <ViewToggle current={view} />
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar filters */}
        <aside className="flex-none w-72 border-r border-gray-100 bg-white overflow-y-auto p-4">
          <FilterPanel searchParams={searchParams} />
        </aside>

        {/* Results */}
        <div className="flex-1 overflow-y-auto bg-background">
          <EstablishmentList searchParams={searchParams} />
        </div>
      </div>
    </div>
  )
}
