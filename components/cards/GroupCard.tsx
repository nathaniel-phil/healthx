import Link from 'next/link'
import { Building2, Bed, MapPin, Globe } from 'lucide-react'
import type { GroupWithCount } from '@/lib/db/groups'

const OWNERSHIP_LABELS: Record<string, string> = {
  INDEPENDENT: 'Independent',
  GROUP:       'Group',
  PE_BACKED:   'PE-backed',
  LISTED:      'Listed',
  FAMILY:      'Family',
}

const OWNERSHIP_COLORS: Record<string, string> = {
  INDEPENDENT: 'bg-gray-100 text-gray-600',
  GROUP:       'bg-blue-50 text-blue-700',
  PE_BACKED:   'bg-pink-50 text-pink-700',
  LISTED:      'bg-purple-50 text-purple-700',
  FAMILY:      'bg-amber-50 text-amber-700',
}

export function GroupCard({ group: g }: { group: GroupWithCount }) {
  return (
    <Link href={`/group/${g.id}`} className="card block p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
              {g.name}
            </h3>
            <span className={`badge text-xs ${OWNERSHIP_COLORS[g.ownershipType] ?? 'bg-gray-100 text-gray-600'}`}>
              {OWNERSHIP_LABELS[g.ownershipType] ?? g.ownershipType}
            </span>
          </div>

          {g.hqCity && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
              <MapPin size={13} className="flex-shrink-0" />
              <span>{g.hqCity}, {g.country}</span>
            </div>
          )}

          {g.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{g.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Building2 size={12} />
              {g.nbEstablishments.toLocaleString()} establishments
            </span>
            {g.totalBeds > 0 && (
              <span className="flex items-center gap-1">
                <Bed size={12} />
                {g.totalBeds.toLocaleString()} beds
              </span>
            )}
            {g.website && (
              <span className="flex items-center gap-1 text-primary">
                <Globe size={12} />
                Website
              </span>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-gray-900">{g.nbEstablishments}</div>
          <div className="text-xs text-gray-400">sites</div>
        </div>
      </div>
    </Link>
  )
}
