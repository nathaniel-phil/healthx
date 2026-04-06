'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const COUNTRIES = [
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'GB', label: '🇬🇧 United Kingdom' },
  { value: 'DE', label: '🇩🇪 Germany' },
  { value: 'ES', label: '🇪🇸 Spain' },
  { value: 'IT', label: '🇮🇹 Italy' },
  { value: 'BE', label: '🇧🇪 Belgium' },
  { value: 'NL', label: '🇳🇱 Netherlands' },
  { value: 'LU', label: '🇱🇺 Luxembourg' },
]

const TYPES = [
  { value: 'LONG_TERM_CARE', label: 'Long-term care (EHPAD)' },
  { value: 'ACUTE_CARE',     label: 'Acute care (clinics)' },
  { value: 'MENTAL_HEALTH',  label: 'Mental health' },
  { value: 'NEW_MEDICINE',   label: 'New medicine / Longevity' },
  { value: 'PALLIATIVE',     label: 'Palliative care' },
  { value: 'PRIMARY_CARE',   label: 'Primary care (MSP)' },
]

const LEGAL = [
  { value: 'PUBLIC',              label: 'Public' },
  { value: 'PRIVATE_FOR_PROFIT',  label: 'Private for-profit' },
  { value: 'PRIVATE_NON_PROFIT',  label: 'Private non-profit' },
  { value: 'ASSOCIATION',         label: 'Association' },
]

const OWNERSHIP = [
  { value: 'INDEPENDENT', label: 'Independent' },
  { value: 'GROUP',        label: 'Part of group' },
  { value: 'PE_BACKED',    label: 'PE-backed' },
  { value: 'LISTED',       label: 'Listed' },
]

const SIGNALS = [
  { value: 'NEW_DIRECTOR',    label: '👔 New director (< 6 mo)' },
  { value: 'FINANCIAL_STRESS',label: '⚠️ Financial stress' },
  { value: 'TENDER',          label: '📋 Active tender' },
  { value: 'BUILDING_PERMIT', label: '🏗 Building permit' },
  { value: 'ACQUISITION',     label: '🤝 M&A activity' },
]

interface Props {
  searchParams: Record<string, string | undefined>
}

export function FilterPanel({ searchParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const update = useCallback((key: string, value: string | undefined) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
    )
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, router, pathname])

  const toggle = useCallback((key: string, value: string) => {
    update(key, searchParams[key] === value ? undefined : value)
  }, [searchParams, update])

  const clearAll = () => router.push(pathname)

  const hasFilters = ['country', 'type', 'legalStatus', 'ownership', 'signal'].some(k => searchParams[k])

  return (
    <div className="space-y-6 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-primary hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* Country */}
      <FilterSection title="Country">
        {COUNTRIES.map(c => (
          <CheckItem
            key={c.value}
            label={c.label}
            checked={searchParams.country === c.value}
            onChange={() => toggle('country', c.value)}
          />
        ))}
      </FilterSection>

      {/* Type */}
      <FilterSection title="Type of establishment">
        {TYPES.map(t => (
          <CheckItem
            key={t.value}
            label={t.label}
            checked={searchParams.type === t.value}
            onChange={() => toggle('type', t.value)}
          />
        ))}
      </FilterSection>

      {/* Legal status */}
      <FilterSection title="Legal status">
        {LEGAL.map(l => (
          <CheckItem
            key={l.value}
            label={l.label}
            checked={searchParams.legalStatus === l.value}
            onChange={() => toggle('legalStatus', l.value)}
          />
        ))}
      </FilterSection>

      {/* Ownership */}
      <FilterSection title="Ownership">
        {OWNERSHIP.map(o => (
          <CheckItem
            key={o.value}
            label={o.label}
            checked={searchParams.ownership === o.value}
            onChange={() => toggle('ownership', o.value)}
          />
        ))}
      </FilterSection>

      {/* Timing signals */}
      <FilterSection title="Timing signals">
        {SIGNALS.map(s => (
          <CheckItem
            key={s.value}
            label={s.label}
            checked={searchParams.signal === s.value}
            onChange={() => toggle('signal', s.value)}
          />
        ))}
      </FilterSection>

      {/* Beds range */}
      <FilterSection title="Number of beds">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            className="input w-20 text-center"
            defaultValue={searchParams.minBeds}
            onChange={e => update('minBeds', e.target.value || undefined)}
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            placeholder="Max"
            className="input w-20 text-center"
            defaultValue={searchParams.maxBeds}
            onChange={e => update('maxBeds', e.target.value || undefined)}
          />
        </div>
      </FilterSection>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function CheckItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 text-primary focus:ring-primary"
      />
      <span className={checked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}>
        {label}
      </span>
    </label>
  )
}
