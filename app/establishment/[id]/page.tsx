import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, Bed, Globe, Phone, Building2, Zap, Users,
  ArrowLeft, Lock, Hash, Calendar, TrendingUp, ShieldCheck,
} from 'lucide-react'
import { getEstablishment } from '@/lib/db/establishments'
import { EstablishmentMap } from '@/components/map/EstablishmentMap'
import { clsx } from 'clsx'

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  LONG_TERM_CARE: 'Long-term care',
  ACUTE_CARE:     'Acute care',
  MENTAL_HEALTH:  'Mental health',
  NEW_MEDICINE:   'New medicine',
  PALLIATIVE:     'Palliative care',
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
  NEW_LOCATION:     'border-health-200 bg-health-50 text-health-800',
  CLOSURE_RISK:     'border-red-200 bg-red-50 text-red-800',
}

const SENIORITY_LABELS: Record<string, string> = {
  C_LEVEL:  'C-Level',
  DIRECTOR: 'Director',
  MANAGER:  'Manager',
  OTHER:    'Other',
}

const SENIORITY_ORDER = ['C_LEVEL', 'DIRECTOR', 'MANAGER', 'OTHER']

// Approx dept centroids for fallback map position
const DEPT_CENTROIDS: Record<string, [number, number]> = {
  '01':[5.36,46.0],'02':[3.39,49.56],'03':[3.25,46.35],'04':[6.24,44.07],
  '05':[6.25,44.67],'06':[7.12,43.93],'07':[4.39,44.75],'08':[4.72,49.77],
  '09':[1.47,42.94],'10':[4.01,48.32],'11':[2.35,43.22],'12':[2.57,44.35],
  '13':[5.37,43.51],'14':[-0.36,49.18],'15':[2.64,45.05],'16':[0.16,45.70],
  '17':[-0.64,45.75],'18':[2.40,47.08],'19':[1.88,45.34],'2A':[9.00,41.86],
  '2B':[9.19,42.40],'21':[4.83,47.32],'22':[-2.78,48.37],'23':[1.95,46.08],
  '24':[0.71,45.15],'25':[6.34,47.26],'26':[5.01,44.73],'27':[1.03,49.07],
  '28':[1.37,48.44],'29':[-4.12,48.24],'30':[4.17,44.02],'31':[1.44,43.60],
  '32':[0.59,43.64],'33':[-0.58,44.84],'34':[3.88,43.61],'35':[-1.67,48.11],
  '36':[1.56,46.81],'37':[0.69,47.22],'38':[5.73,45.26],'39':[5.55,46.67],
  '40':[-0.74,44.02],'41':[1.33,47.59],'42':[4.07,45.70],'43':[3.88,45.08],
  '44':[-1.56,47.35],'45':[2.00,47.91],'46':[1.67,44.66],'47':[0.47,44.36],
  '48':[3.50,44.52],'49':[-0.55,47.39],'50':[-1.37,49.11],'51':[4.03,49.04],
  '52':[5.14,48.11],'53':[-0.63,48.07],'54':[6.18,48.69],'55':[5.38,48.98],
  '56':[-2.75,47.87],'57':[6.54,49.03],'58':[3.52,47.07],'59':[3.09,50.54],
  '60':[2.45,49.41],'61':[0.09,48.62],'62':[2.24,50.51],'63':[3.08,45.75],
  '64':[-0.75,43.30],'65':[0.14,43.15],'66':[2.59,42.65],'67':[7.49,48.57],
  '68':[7.35,47.84],'69':[4.83,45.76],'70':[6.10,47.62],'71':[4.50,46.58],
  '72':[0.20,48.00],'73':[6.39,45.52],'74':[6.35,46.01],'75':[2.35,48.86],
  '76':[0.76,49.56],'77':[2.97,48.63],'78':[1.86,48.79],'79':[-0.32,46.63],
  '80':[2.30,49.95],'81':[2.15,43.81],'82':[1.34,44.02],'83':[6.13,43.47],
  '84':[5.08,43.94],'85':[-1.43,46.67],'86':[0.59,46.58],'87':[1.25,45.84],
  '88':[6.43,48.19],'89':[3.57,47.80],'90':[6.83,47.63],'91':[2.24,48.47],
  '92':[2.24,48.88],'93':[2.45,48.92],'94':[2.44,48.77],'95':[2.20,49.07],
}

type Tab = 'overview' | 'ownership' | 'contacts'

const TABS: { value: Tab; label: string }[] = [
  { value: 'overview',  label: 'Overview' },
  { value: 'ownership', label: 'Ownership Report' },
  { value: 'contacts',  label: 'Contacts' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EstablishmentPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>
  searchParams: Promise<{ tab?: Tab }>
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const tab = sp.tab ?? 'overview'

  const est = await getEstablishment(id)
  if (!est) notFound()

  const sortedContacts = [...est.contacts].sort(
    (a, b) => SENIORITY_ORDER.indexOf(a.seniority) - SENIORITY_ORDER.indexOf(b.seniority)
  )

  // Resolve map coordinates — exact if available, dept centroid as fallback
  const mapCoords = (() => {
    if (est.lat && est.lng) return { lat: est.lat, lng: est.lng, approximate: false }
    const c = DEPT_CENTROIDS[est.department?.trim() ?? '']
    return c ? { lat: c[1], lng: c[0], approximate: true } : null
  })()

  const tabHref = (t: Tab) => `/establishment/${id}?tab=${t}`

  return (
    <div className="pt-14 min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Back */}
        <Link href="/search" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft size={14} /> Back to search
        </Link>

        {/* ── Header card ─────────────────────────────────────────── */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={clsx('badge text-xs', TYPE_COLORS[est.type] ?? 'bg-gray-100 text-gray-600')}>
                  {TYPE_LABELS[est.type] ?? est.type}
                </span>
                {est.legalStatus && (
                  <span className="badge bg-gray-100 text-gray-600 text-xs capitalize">
                    {est.legalStatus.replace(/_/g, ' ').toLowerCase()}
                  </span>
                )}
                {est.signals.length > 0 && (
                  <span className="badge bg-amber-50 text-amber-700 text-xs">
                    <Zap size={10} /> {est.signals.length} signal{est.signals.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2 leading-tight">{est.name}</h1>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin size={14} className="flex-shrink-0" />
                {[est.address, est.city, est.department, est.country].filter(Boolean).join(', ')}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={clsx(
                'text-3xl font-bold',
                est.dataQualityScore >= 70 ? 'text-health-600' :
                est.dataQualityScore >= 40 ? 'text-amber-600' : 'text-gray-400'
              )}>
                {est.dataQualityScore}
              </div>
              <div className="text-xs text-gray-400">Quality score</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 border-t border-gray-100 pt-3 -mb-1">
            {TABS.map(t => (
              <Link
                key={t.value}
                href={tabHref(t.value)}
                className={clsx(
                  'px-4 py-2 text-sm font-medium rounded-t-md transition-colors',
                  tab === t.value
                    ? 'text-primary bg-primary/5 border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                )}
              >
                {t.label}
                {t.value === 'contacts' && sortedContacts.length > 0 && (
                  <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                    {sortedContacts.length}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Tab content + sidebar ────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-6">

          {/* Main column */}
          <div className="col-span-2 space-y-5">

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <>
                {/* Key stats */}
                <div className="card p-6">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Key information</h2>
                  <div className="grid grid-cols-3 gap-y-5 gap-x-4">
                    {est.beds         && <Stat icon={<Bed size={15} />}       label="Beds"       value={est.beds.toLocaleString()} />}
                    {est.capacity     && <Stat icon={<Users size={15} />}     label="Capacity"   value={est.capacity.toLocaleString()} />}
                    {est.employeeCount && <Stat icon={<Users size={15} />}    label="Employees"  value={est.employeeCount.toLocaleString()} />}
                    {est.foundedYear  && <Stat icon={<Calendar size={15} />}  label="Founded"    value={est.foundedYear} />}
                    {est.revenueRange && <Stat icon={<TrendingUp size={15} />} label="Revenue"   value={est.revenueRange} />}
                    {est.subtype      && <Stat icon={<Building2 size={15} />} label="Category"   value={est.subtype} />}
                    {est.phone        && <Stat icon={<Phone size={15} />}     label="Phone"      value={<a href={`tel:${est.phone}`} className="hover:text-primary">{est.phone}</a>} />}
                    {est.website      && (
                      <Stat icon={<Globe size={15} />} label="Website"
                        value={<a href={est.website} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate block">{est.website.replace(/^https?:\/\//, '')}</a>}
                      />
                    )}
                  </div>
                </div>

                {/* Map */}
                {mapCoords && (
                  <div className="card overflow-hidden">
                    <div className="h-56">
                      <EstablishmentMap
                        lat={mapCoords.lat}
                        lng={mapCoords.lng}
                        name={est.name}
                        approximate={mapCoords.approximate}
                      />
                    </div>
                  </div>
                )}

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
                            <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="text-xs underline opacity-70 mt-1 inline-block">
                              Source →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── OWNERSHIP REPORT ── */}
            {tab === 'ownership' && (
              <div className="space-y-5">
                <div className="card p-6">
                  <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-primary" /> Ownership structure
                  </h2>
                  <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div>
                      <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Ownership type</dt>
                      <dd className="font-medium capitalize">{est.ownershipType.replace(/_/g, ' ').toLowerCase()}</dd>
                    </div>
                    {est.legalStatus && (
                      <div>
                        <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Legal status</dt>
                        <dd className="font-medium capitalize">{est.legalStatus.replace(/_/g, ' ').toLowerCase()}</dd>
                      </div>
                    )}
                    {est.group && (
                      <div>
                        <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Group owner</dt>
                        <dd>
                          <Link href={`/group/${est.group.id}`} className="font-medium text-primary hover:underline">
                            {est.group.name}
                          </Link>
                        </dd>
                      </div>
                    )}
                    {est.foundedYear && (
                      <div>
                        <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Founded</dt>
                        <dd className="font-medium">{est.foundedYear}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Source identifiers */}
                <div className="card p-6">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Hash size={16} className="text-gray-400" /> Registry identifiers
                  </h2>
                  <dl className="space-y-3 text-sm">
                    {est.finessId && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">FINESS ET</dt>
                        <dd className="font-mono font-medium">{est.finessId}</dd>
                      </div>
                    )}
                    {est.cqcId && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">CQC ID</dt>
                        <dd className="font-mono font-medium">{est.cqcId}</dd>
                      </div>
                    )}
                    {est.externalId && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">External ID</dt>
                        <dd className="font-mono font-medium">{est.externalId}</dd>
                      </div>
                    )}
                    {est.lastUpdated && (
                      <div className="flex justify-between pt-2 border-t border-gray-100">
                        <dt className="text-gray-400 text-xs">Last updated</dt>
                        <dd className="text-gray-400 text-xs">{new Date(est.lastUpdated).toLocaleDateString('en-GB')}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}

            {/* ── CONTACTS ── */}
            {tab === 'contacts' && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-gray-900">Decision-makers</h2>
                  {sortedContacts.length > 0 && (
                    <button className="btn-primary text-sm py-1.5">
                      Unlock all · {sortedContacts.length} credit{sortedContacts.length > 1 ? 's' : ''}
                    </button>
                  )}
                </div>

                {sortedContacts.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No contacts identified yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {sortedContacts.map(c => (
                      <div key={c.id} className="flex items-center justify-between py-3 gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {(c.firstName?.[0] ?? c.lastName[0]).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {c.firstName ? `${c.firstName} ${c.lastName}` : c.lastName}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{c.title}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="badge bg-gray-100 text-gray-500 text-xs">
                            {SENIORITY_LABELS[c.seniority] ?? c.seniority}
                          </span>
                          <button className="p-1 rounded text-gray-300 hover:text-primary hover:bg-primary/5 transition-colors">
                            <Lock size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Group */}
            {est.group && (
              <div className="card p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Part of group</h3>
                <Link href={`/group/${est.group.id}`} className="font-semibold text-primary hover:underline block mb-1">
                  {est.group.name}
                </Link>
                <p className="text-xs text-gray-500 capitalize mb-3">
                  {est.ownershipType.replace(/_/g, ' ').toLowerCase()}
                </p>
                <Link href={`/group/${est.group.id}`} className="text-xs text-primary hover:underline">
                  View group profile →
                </Link>
              </div>
            )}

            {/* Quick contacts */}
            <div className="card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                Decision-makers ({sortedContacts.length})
              </h3>
              {sortedContacts.length === 0 ? (
                <p className="text-sm text-gray-400">None identified yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {sortedContacts.slice(0, 3).map(c => (
                    <ContactRow key={c.id} contact={c} />
                  ))}
                  {sortedContacts.length > 3 && (
                    <Link href={tabHref('contacts')} className="text-xs text-primary hover:underline block pt-1">
                      +{sortedContacts.length - 3} more contacts →
                    </Link>
                  )}
                </div>
              )}
              {sortedContacts.length > 0 && (
                <button className="btn-primary w-full mt-3 justify-center text-xs py-1.5">
                  Unlock all · {sortedContacts.length} credit{sortedContacts.length > 1 ? 's' : ''}
                </button>
              )}
            </div>

            {/* Source IDs */}
            <div className="card p-4 text-xs text-gray-400 space-y-1.5">
              {est.finessId   && <div className="flex justify-between"><span>FINESS</span><span className="font-mono">{est.finessId}</span></div>}
              {est.cqcId      && <div className="flex justify-between"><span>CQC</span><span className="font-mono">{est.cqcId}</span></div>}
              {est.externalId && <div className="flex justify-between"><span>Ext. ID</span><span className="font-mono">{est.externalId}</span></div>}
              {est.lastUpdated && (
                <div className="flex justify-between pt-1 border-t border-gray-50">
                  <span>Updated</span>
                  <span>{new Date(est.lastUpdated).toLocaleDateString('en-GB')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-gray-400 text-xs mb-0.5">{icon} {label}</div>
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
      <button className="flex-shrink-0 p-1 rounded text-gray-300 hover:text-primary hover:bg-primary/5 transition-colors">
        <Lock size={14} />
      </button>
    </div>
  )
}
