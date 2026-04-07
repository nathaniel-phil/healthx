import { GroupCard } from './GroupCard'
import { getGroups } from '@/lib/db/groups'
import { Pagination } from '@/components/ui/Pagination'

const PAGE_SIZE = 25

interface Props {
  searchParams: Record<string, string | undefined>
}

export async function GroupList({ searchParams }: Props) {
  const page = Number(searchParams.page ?? 1)

  const { items, total } = await getGroups({
    q:       searchParams.q,
    country: searchParams.country as any,
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{total.toLocaleString()}</span> groups
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium mb-1">No groups found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(g => <GroupCard key={g.id} group={g} />)}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="mt-8">
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} searchParams={searchParams} />
        </div>
      )}
    </div>
  )
}
