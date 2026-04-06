import { EstablishmentCard } from './EstablishmentCard'
import { getEstablishments } from '@/lib/db/establishments'
import { Pagination } from '@/components/ui/Pagination'

const PAGE_SIZE = 25

interface Props {
  searchParams: Record<string, string | undefined>
}

export async function EstablishmentList({ searchParams }: Props) {
  const page = Number(searchParams.page ?? 1)

  const { items, total } = await getEstablishments({
    q:           searchParams.q,
    country:     searchParams.country as any,
    type:        searchParams.type as any,
    legalStatus: searchParams.legalStatus as any,
    ownership:   searchParams.ownership as any,
    signal:      searchParams.signal as any,
    minBeds:     searchParams.minBeds ? Number(searchParams.minBeds) : undefined,
    maxBeds:     searchParams.maxBeds ? Number(searchParams.maxBeds) : undefined,
    page,
    pageSize:    PAGE_SIZE,
  })

  return (
    <div className="p-6">
      {/* Result count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{total.toLocaleString()}</span> establishments
        </p>
        <button className="btn-secondary text-xs py-1.5">
          Export CSV
        </button>
      </div>

      {/* Cards */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium mb-1">No results found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(est => (
            <EstablishmentCard key={est.id} establishment={est} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="mt-8">
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} searchParams={searchParams} />
        </div>
      )}
    </div>
  )
}
