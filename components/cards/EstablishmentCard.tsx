import Link from 'next/link'
import { MapPin, Bed, Users, Zap } from 'lucide-react'
import { clsx } from 'clsx'
import type { EstablishmentWithSignals } from '@/lib/db/establishments'

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

const SIGNAL_COLORS: Record<string, string> = {
  NEW_DIRECTOR:     'bg-signal-new/10 text-signal-new',
  FINANCIAL_STRESS: 'bg-signal-stress/10 text-signal-stress',
  TENDER:           'bg-signal-tender/10 text-signal-tender',
  BUILDING_PERMIT:  'bg-signal-permit/10 text-signal-permit',
  ACQUISITION:      'bg-signal-acquisition/10 text-signal-acquisition',
}

const SIGNAL_LABELS: Record<string, string> = {
  NEW_DIRECTOR:     'New director',
  FINANCIAL_STRESS: 'Financial stress',
  TENDER:           'Active tender',
  BUILDING_PERMIT:  'Building permit',
  ACQUISITION:      'M&A activity',
  NEW_LOCATION:     'New location',
  CLOSURE_RISK:     'Closure risk',
}

interface Props {
  establishment: EstablishmentWithSignals
}

export function EstablishmentCard({ establishment: e }: Props) {
  return (
    <Link href={`/establishment/${e.id}`} className="card block p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Name + type */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
              {e.name}
            </h3>
            <span className={clsx('badge text-xs', TYPE_COLORS[e.type] ?? 'bg-gray-100 text-gray-600')}>
              {TYPE_LABELS[e.type] ?? e.type}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <MapPin size={13} className="flex-shrink-0" />
            <span>{[e.city, e.region, e.country].filter(Boolean).join(', ')}</span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {e.beds && (
              <span className="flex items-center gap-1">
                <Bed size={12} /> {e.beds} beds
              </span>
            )}
            {e.group && (
              <span className="flex items-center gap-1">
                <Users size={12} /> {e.group.name}
              </span>
            )}
            {e.legalStatus && (
              <span className="capitalize">{e.legalStatus.replace(/_/g, ' ').toLowerCase()}</span>
            )}
          </div>
        </div>

        {/* Signals */}
        <div className="flex flex-col gap-1 items-end flex-shrink-0">
          {e.signals.slice(0, 2).map(s => (
            <span key={s.id} className={clsx('badge text-xs', SIGNAL_COLORS[s.type] ?? 'bg-gray-100 text-gray-600')}>
              <Zap size={10} />
              {SIGNAL_LABELS[s.type] ?? s.type}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
