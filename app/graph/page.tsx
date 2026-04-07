import { Suspense } from 'react'
import Link from 'next/link'
import { getGraphData } from '@/lib/db/graph'
import type { GraphNode, GraphLink } from '@/components/graph/OwnershipGraph'
import { GraphLoader } from '@/components/graph/GraphLoader'
import { Network } from 'lucide-react'

const COUNTRIES = [
  { value: '',   label: 'All countries' },
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'GB', label: '🇬🇧 UK' },
  { value: 'DE', label: '🇩🇪 Germany' },
  { value: 'ES', label: '🇪🇸 Spain' },
]

const OWNERSHIPS = [
  { value: '',           label: 'All types' },
  { value: 'PE_BACKED',  label: 'PE-backed' },
  { value: 'LISTED',     label: 'Listed' },
  { value: 'GROUP',      label: 'Group' },
  { value: 'FAMILY',     label: 'Family' },
  { value: 'INDEPENDENT',label: 'Independent' },
]

const LEGEND_GROUPS = [
  { color: '#6B7280', label: 'Independent' },
  { color: '#2563EB', label: 'Group' },
  { color: '#EC4899', label: 'PE-backed' },
  { color: '#7C3AED', label: 'Listed' },
  { color: '#D97706', label: 'Family' },
]

const LEGEND_ESTS = [
  { color: '#D97706', label: 'Long-term care' },
  { color: '#DC2626', label: 'Acute care' },
  { color: '#7C3AED', label: 'Mental health' },
  { color: '#059669', label: 'New medicine' },
  { color: '#2563EB', label: 'Primary care' },
]

interface PageProps {
  searchParams: Promise<{
    country?: string
    ownership?: string
  }>
}

async function GraphContent({ country, ownership }: { country?: string; ownership?: string }) {
  const rawGroups = await getGraphData({ country, ownershipType: ownership })

  if (rawGroups.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-400">
        <Network size={40} strokeWidth={1} />
        <div className="text-center">
          <p className="font-medium text-gray-600">No groups found</p>
          <p className="text-sm">Try adjusting the filters</p>
        </div>
      </div>
    )
  }

  // Build D3-compatible node & link arrays
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []
  const seenEstIds = new Set<string>()

  for (const group of rawGroups) {
    nodes.push({
      id:              group.id,
      name:            group.name,
      nodeType:        'group',
      ownershipType:   group.ownershipType,
      country:         group.country,
      nbEstablishments: group.nbEstablishments,
    })

    for (const est of group.establishments) {
      if (!seenEstIds.has(est.id)) {
        seenEstIds.add(est.id)
        nodes.push({
          id:       est.id,
          name:     est.name,
          nodeType: 'establishment',
          estType:  est.type,
          city:     est.city,
        })
      }
      links.push({ source: group.id, target: est.id })
    }
  }

  return <GraphLoader nodes={nodes} links={links} />
}

export default async function GraphPage({ searchParams }: PageProps) {
  const { country, ownership } = await searchParams

  const filterHref = (key: string, value: string) => {
    const p = new URLSearchParams()
    if (key !== 'country'   && country)   p.set('country',   country)
    if (key !== 'ownership' && ownership) p.set('ownership', ownership)
    if (value) p.set(key, value)
    const qs = p.toString()
    return `/graph${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="pt-14 h-screen flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="flex-none border-b border-gray-100 bg-white px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Network size={14} className="text-primary" />
          </div>
          <h1 className="font-semibold text-gray-900 text-sm">Ownership Network</h1>
        </div>

        {/* Country filter */}
        <div className="flex items-center gap-1.5">
          {COUNTRIES.map(c => (
            <Link
              key={c.value}
              href={filterHref('country', c.value)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                (country ?? '') === c.value
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        <div className="h-4 w-px bg-gray-200" />

        {/* Ownership filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {OWNERSHIPS.map(o => (
            <Link
              key={o.value}
              href={filterHref('ownership', o.value)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                (ownership ?? '') === o.value
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {o.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto text-xs text-gray-400">
          Drag nodes · Scroll to zoom · Click for details
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0">

        {/* Legend sidebar */}
        <aside className="flex-none w-48 border-r border-gray-100 bg-white p-4 space-y-5 overflow-y-auto">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Groups (by ownership)
            </p>
            <div className="space-y-1.5">
              {LEGEND_GROUPS.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                    style={{ background: item.color, width: 14, height: 14 }}
                  />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Establishments
            </p>
            <div className="space-y-1.5">
              {LEGEND_ESTS.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="rounded-full flex-shrink-0"
                    style={{ background: item.color, width: 8, height: 8 }}
                  />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 space-y-1">
            <p>● Group node size ∝ number of establishments</p>
            <p>· Small dots = establishments</p>
          </div>
        </aside>

        {/* Graph canvas */}
        <div className="flex-1 relative">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
                  <p className="text-sm text-gray-500">Loading graph data…</p>
                </div>
              </div>
            }
          >
            <GraphContent country={country} ownership={ownership} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
