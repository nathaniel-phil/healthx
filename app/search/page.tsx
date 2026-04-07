import { Suspense } from 'react'
import Link from 'next/link'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { EstablishmentList } from '@/components/cards/EstablishmentList'
import { GroupList } from '@/components/cards/GroupList'
import { SearchBar } from '@/components/ui/SearchBar'
import { ViewToggle } from '@/components/ui/ViewToggle'
import { MapPanel } from '@/components/map/MapPanel'
import { Bookmark } from 'lucide-react'

type Tab = 'establishments' | 'groups' | 'contacts'
type View = 'list' | 'split' | 'map'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    country?: string
    type?: string
    legalStatus?: string
    groupId?: string
    department?: string
    minBeds?: string
    maxBeds?: string
    signal?: string
    ownership?: string
    tab?: Tab
    view?: View
    page?: string
  }>
}

const TABS: { value: Tab; label: string }[] = [
  { value: 'establishments', label: 'Establishments' },
  { value: 'groups',         label: 'Groups' },
  { value: 'contacts',       label: 'Contacts' },
]

const LIST_SKELETON = (
  <div className="p-6 space-y-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="h-24 bg-white rounded-xl border border-gray-100 animate-pulse" />
    ))}
  </div>
)

const FILTER_SKELETON = (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
    ))}
  </div>
)

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const view = (params.view ?? 'list') as View
  const tab  = (params.tab  ?? 'establishments') as Tab

  const isSplit = view === 'split'
  const isMap   = view === 'map'
  const showMap = isSplit || isMap

  // Build tab href helper (preserve all other params, reset page)
  const tabHref = (t: Tab) => {
    const p = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
    )
    p.set('tab', t)
    p.delete('page')
    return `/search?${p.toString()}`
  }

  return (
    <div className="pt-14 h-screen flex flex-col">

      {/* ── Top bar ────────────────────────────────────────────────── */}
      <div className="flex-none border-b border-gray-100 bg-white px-4 py-2.5 flex items-center gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-r border-gray-100 pr-3 mr-1">
          {TABS.map(t => (
            <Link
              key={t.value}
              href={tabHref(t.value)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                tab === t.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Search bar */}
        <div className="flex-1">
          <Suspense fallback={<div className="h-9 bg-gray-100 rounded-lg animate-pulse" />}>
            <SearchBar defaultValue={params.q} />
          </Suspense>
        </div>

        {/* Save Search */}
        <button
          className="flex items-center gap-1.5 btn-secondary text-sm py-1.5 px-3 whitespace-nowrap"
          title="Save this search"
        >
          <Bookmark size={14} />
          <span className="hidden md:inline">Save</span>
        </button>

        {/* View toggle — only for establishments tab */}
        {tab === 'establishments' && (
          <Suspense fallback={<div className="w-24 h-9 bg-gray-100 rounded-lg animate-pulse" />}>
            <ViewToggle current={view} />
          </Suspense>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0">

        {/* Sidebar filters */}
        <aside className="flex-none w-64 border-r border-gray-100 bg-white overflow-y-auto p-4">
          <Suspense fallback={FILTER_SKELETON}>
            <FilterPanel searchParams={params} />
          </Suspense>
        </aside>

        {/* Main content — full map, split, or list */}
        {isMap ? (
          /* Full-screen map */
          <div className="flex-1 relative">
            <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse" />}>
              <MapPanel searchParams={params} />
            </Suspense>
          </div>
        ) : isSplit ? (
          /* Split view: list left, map right */
          <div className="flex-1 flex min-w-0">
            <div className="w-1/2 overflow-y-auto border-r border-gray-100 bg-background">
              <Suspense fallback={LIST_SKELETON}>
                <EstablishmentList searchParams={params} />
              </Suspense>
            </div>
            <div className="w-1/2 relative">
              <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse" />}>
                <MapPanel searchParams={params} />
              </Suspense>
            </div>
          </div>
        ) : (
          /* List-only view */
          <div className="flex-1 overflow-y-auto bg-background">
            <Suspense fallback={LIST_SKELETON}>
              {tab === 'establishments' && <EstablishmentList searchParams={params} />}
              {tab === 'groups'         && <GroupList searchParams={params} />}
              {tab === 'contacts'       && (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-2">
                  <p className="text-lg font-medium">Contacts coming soon</p>
                  <p className="text-sm">Unlock decision-makers with Pro plan</p>
                </div>
              )}
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}
