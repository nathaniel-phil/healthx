import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Bed, Globe, Phone, Building2, Zap, Users, ArrowLeft, Lock } from 'lucide-react'
import { getEstablishment } from '@/lib/db/establishments'
import { clsx } from 'clsx'

const TYPE_LABELS: Record<string, string> = {
  LONG_TERM_CARE: 'Long-term care',
  ACUTE_CARE:     'Acute care',
  MENTAL_HEALTH:  'Mental health',
  NEW_MEDICINE:   'New medicine',
  PALLIATIVE:     'Palliative care',
  PRIMARY_CARE:   'Primary care',
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

const SIGNAL_COLORS: Record<string, string> = {
  NEW_DIRECTOR:     'border-amber-200 bg-amber-50 text-amber-800',
  FINANCIAL_STRESS: 'border-red-200 bg-red-50 text-red-800',
  TENDER:           'border-purple-200 bg-purple-50 text-purple-800',
  BUILDING_PERMIT:  'border-blue-200 bg-blue-50 text-blue-800',
  ACQUISITION:      'border-pink-200 bg-pink-50 text-pink-800',
}

const SENIORITY_ORDER = ['C_LEVEL', 'DIRECTOR', 'MANAGER', 'OTHER']

export default async function EstablishmentPage({ params }: { params: { id: string } }) {
  const est = await getEstablishment(params.id)
  if (!est) notFound()

  const sortedContacts = [...est.contacts].sort(
    (a, b) => SENIORITY_ORDER.indexOf(a.seniority) - SENIORITY_ORDER.indexOf(b.seniority)
  )

  return (
    <div className="pt-14 max-w-5xl mx-auto px-6 py-8">
      {/* Back */}
      <Link href="/search" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={14} /> Back to search
      </Link>

      <div className="grid grid-cols-3 gap-8">
        {/* Main */}
        <div className="col-span-2 space-y-6">

          {/* Header */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="badge bg-primary-50 text-primary text-xs">
                    {TYPE_LABELS[est.type] ?? est.type}
                  </span>
                  {est.legalStatus && (
                    <span className="badge bg-gray-100 text-gray-600 text-xs capitalize">
                      {est.legalStatus.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  )}
                </div>
                <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">{est.name}</h1>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin size={14} />
                  {[est.address, est.city, est.region, est.country].filter(Boolean).join(', ')}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-bold text-gray-900">{est.dataQualityScore}</div>
                <div className="text-xs text-gray-400">Quality score</div>
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              {est.beds && (
                <Stat icon={<Bed size={16} />} label="Beds" value={est.beds} />
              )}
              {est.employeeCount && (
                <Stat icon={<Users size={16} />} label="Employees" value={est.employeeCount.toLocaleString()} />
              )}
              {est.foundedYear && (
                <Stat icon={<Building2 size={16} />} label="Founded" value={est.foundedYear} />
              )}
              {est.revenueRange && (
                <Stat icon={<Building2 size={16} />} label="Revenue" value={est.revenueRange} />
              )}
              {est.website && (
                <Stat
                  icon={<Globe size={16} />}
                  label="Website"
                  value={<a href={est.website} target="_blank" className="text-primary hover:underline truncate block">{est.website}</a>}
                />
              )}
              {est.phone && (
                <Stat icon={<Phone size={16} />} label="Phone" value={est.phone} />
              )}
            </div>
          </div>

          {/* Timing signals */}
          {est.signals.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap size={16} className="text-amber-500" /> Timing signals
              </h2>
              <div className="space-y-3">
                {est.signals.map(s => (
                  <div key={s.id} className={clsx('rounded-lg border p-3', SIGNAL_COLORS[s.type] ?? 'border-gray-200 bg-gray-50')}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">{SIGNAL_LABELS[s.type] ?? s.type}</span>
                      <span className="text-xs opacity-70">
                        {new Date(s.detectedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm mt-1 opacity-90">{s.description}</p>
                    {s.sourceUrl && (
                      <a href={s.sourceUrl} target="_blank" className="text-xs underline opacity-70 mt-1 inline-block">
                        Source
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Group */}
          {est.group && (
            <div className="card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Part of group</h3>
              <Link href={`/group/${est.group.id}`} className="font-semibold text-primary hover:underline">
                {est.group.name}
              </Link>
              <p className="text-xs text-gray-500 mt-1 capitalize">
                {est.ownershipType.replace(/_/g, ' ').toLowerCase()}
              </p>
            </div>
          )}

          {/* Contacts */}
          <div className="card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Decision-makers ({sortedContacts.length})
            </h3>
            {sortedContacts.length === 0 ? (
              <p className="text-sm text-gray-400">No contacts identified yet.</p>
            ) : (
              <div className="space-y-3">
                {sortedContacts.map(c => (
                  <ContactRow key={c.id} contact={c} />
                ))}
              </div>
            )}
            {sortedContacts.length > 0 && (
              <button className="btn-primary w-full mt-4 justify-center text-sm">
                Unlock all contacts · {sortedContacts.length} credit{sortedContacts.length > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Source IDs */}
          <div className="card p-4 text-xs text-gray-400 space-y-1">
            {est.finessId && <div>FINESS: {est.finessId}</div>}
            {est.cqcId && <div>CQC: {est.cqcId}</div>}
            {est.externalId && <div>External ID: {est.externalId}</div>}
            {est.lastUpdated && (
              <div>Last updated: {new Date(est.lastUpdated).toLocaleDateString('en-GB')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-gray-400 text-xs mb-0.5">
        {icon} {label}
      </div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  )
}

function ContactRow({ contact: c }: { contact: any }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {c.firstName ? `${c.firstName} ${c.lastName}` : c.lastName}
        </div>
        <div className="text-xs text-gray-500 truncate">{c.title}</div>
      </div>
      <button className="flex-shrink-0 p-1 rounded text-gray-300 hover:text-primary hover:bg-primary-50 transition-colors">
        <Lock size={14} />
      </button>
    </div>
  )
}
