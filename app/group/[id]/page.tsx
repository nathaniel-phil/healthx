import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Building2, Bed, MapPin, Globe, Lock,
  Users, TrendingUp, Map,
} from 'lucide-react'
import { getGroup } from '@/lib/db/groups'
import { clsx } from 'clsx'

const TYPE_LABELS: Record<string, string> = {
  LONG_TERM_CARE: 'Long-term care',
  ACUTE_CARE:     'Acute care',
  MENTAL_HEALTH:  'Mental health',
  NEW_MEDICINE:   'New medicine',
  PALLIATIVE:     'Palliative',
  PRIMARY_CARE:   'Primary care',
}

const TYPE_COLORS: Record<string, string> = {
  LONG_TERM_CARE: 'bg-amber-50 text-amber-700',
  ACUTE_CARE:     'bg-red-50 text-red-700',
  MENTAL_HEALTH:  'bg-purple-50 text-purple-700',
  NEW_MEDICINE:   'bg-health-50 text-health-700',
  PALLIATIVE:     'bg-gray-100 text-gray-600',
  PRIMARY_CARE:   'bg-blue-50 text-blue-700',
}

const OWNERSHIP_LABELS: Record<string, string> = {
  INDEPENDENT: 'Independent',
  GROUP:       'Group',
  PE_BACKED:   'PE-backed',
  LISTED:      'Listed company',
  FAMILY:      'Family-owned',
}

const SENIORITY_ORDER = ['C_LEVEL', 'DIRECTOR', 'MANAGER', 'OTHER']
const SENIORITY_LABELS: Record<string, string> = {
  C_LEVEL:  'C-Level',
  DIRECTOR: 'Director',
  MANAGER:  'Manager',
  OTHER:    'Other',
}

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const group = await getGroup(id)
  if (!group) notFound()

  const sortedContacts = [...group.contacts].sort(
    (a, b) => SENIORITY_ORDER.indexOf(a.seniority) - SENIORITY_ORDER.indexOf(b.seniority)
  )

  // Compute stats from establishment list
  const uniqueDepts = Array.from(new Set(
    group.establishments.map(e => e.department).filter((d): d is string => d !== null)
  ))
  const totalBeds = group.establishments.reduce((sum, e) => sum + (e.beds ?? 0), 0)

  // Type breakdown
  const typeBreakdown = group.establishments.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="pt-14 min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Back */}
        <Link href="/search?tab=groups" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft size={14} /> Back to groups
        </Link>

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="badge bg-gray-100 text-gray-600 text-xs">
                  {OWNERSHIP_LABELS[group.ownershipType] ?? group.ownershipType}
                </span>
                <span className="badge bg-primary/10 text-primary text-xs">{group.country}</span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
              {group.hqCity && (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin size={14} /> {group.hqCity}, {group.country}
                </div>
              )}
            </div>
            {group.website && (
              <a
                href={group.website} target="_blank" rel="noreferrer"
                className="btn-secondary text-sm py-1.5 flex-shrink-0"
              >
                <Globe size={14} /> Website
              </a>
            )}
          </div>

          {group.description && (
            <p className="text-sm text-gray-600 mt-4 leading-relaxed border-t border-gray-100 pt-4">
              {group.description}
            </p>
          )}
        </div>

        {/* ── Stats bar ────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Building2 size={20} className="text-primary" />}
            value={group.nbEstablishments.toLocaleString()}
            label="Establishments"
          />
          <StatCard
            icon={<Bed size={20} className="text-health-600" />}
            value={totalBeds > 0 ? totalBeds.toLocaleString() : '—'}
            label="Total beds"
          />
          <StatCard
            icon={<Map size={20} className="text-amber-500" />}
            value={uniqueDepts.length > 0 ? uniqueDepts.length.toString() : '—'}
            label="Departments"
          />
          <StatCard
            icon={<Users size={20} className="text-purple-500" />}
            value={sortedContacts.length.toString()}
            label="Contacts"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* ── Establishments list ───────────────────────────────── */}
          <div className="col-span-2 space-y-4">

            {/* Type breakdown */}
            {Object.keys(typeBreakdown).length > 0 && (
              <div className="card p-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Breakdown by type</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(typeBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <span key={type} className={clsx('badge text-xs', TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-600')}>
                        {TYPE_LABELS[type] ?? type}
                        <span className="ml-1 opacity-70">·  {count}</span>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Establishments */}
            <div className="card divide-y divide-gray-100">
              <div className="px-4 py-3 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 text-sm">
                  All establishments
                  <span className="ml-2 text-gray-400 font-normal">({group.establishments.length})</span>
                </h2>
                <Link
                  href={`/search?groupId=${group.id}`}
                  className="text-xs text-primary hover:underline"
                >
                  View on map →
                </Link>
              </div>

              {group.establishments.length === 0 ? (
                <div className="px-4 py-10 text-center text-gray-400 text-sm">
                  No establishments listed yet.
                </div>
              ) : (
                group.establishments.map(e => (
                  <Link
                    key={e.id}
                    href={`/establishment/${e.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors truncate">
                          {e.name}
                        </span>
                        <span className={clsx('badge text-xs shrink-0', TYPE_COLORS[e.type] ?? 'bg-gray-100 text-gray-600')}>
                          {TYPE_LABELS[e.type] ?? e.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {e.city}{e.department ? ` (${e.department})` : ''}
                        </span>
                        {e.beds && (
                          <span className="flex items-center gap-1">
                            <Bed size={11} /> {e.beds} beds
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-300 flex-shrink-0">
                      {e.dataQualityScore}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Contacts */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Contacts ({sortedContacts.length})
                </h3>
                {sortedContacts.length > 0 && (
                  <TrendingUp size={13} className="text-gray-300" />
                )}
              </div>

              {sortedContacts.length === 0 ? (
                <p className="text-sm text-gray-400">No group-level contacts yet.</p>
              ) : (
                <div className="space-y-3">
                  {sortedContacts.map(c => (
                    <div key={c.id} className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {(c.firstName?.[0] ?? c.lastName[0]).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {c.firstName ? `${c.firstName} ${c.lastName}` : c.lastName}
                          </div>
                          <div className="text-xs text-gray-400 truncate">{c.title}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-gray-400">{SENIORITY_LABELS[c.seniority]}</span>
                        <button className="p-1 rounded text-gray-300 hover:text-primary hover:bg-primary/5 transition-colors">
                          <Lock size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sortedContacts.length > 0 && (
                <button className="btn-primary w-full mt-4 justify-center text-xs py-1.5">
                  Unlock all · {sortedContacts.length} credit{sortedContacts.length > 1 ? 's' : ''}
                </button>
              )}
            </div>

            {/* Departments covered */}
            {uniqueDepts.length > 0 && (
              <div className="card p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                  Departments ({uniqueDepts.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueDepts.sort().map(d => (
                    <Link
                      key={d}
                      href={`/search?department=${d}`}
                      className="badge bg-gray-100 text-gray-600 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {d}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-gray-900 leading-tight">{value}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    </div>
  )
}
