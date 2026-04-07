import { prisma } from '@/lib/prisma'

export interface GraphGroup {
  id: string
  name: string
  ownershipType: string
  country: string
  nbEstablishments: number
  establishments: {
    id: string
    name: string
    type: string
    city: string
  }[]
}

/**
 * Returns the top N groups (by establishment count) with their
 * establishments for the ownership graph.
 *
 * We cap establishments per group to keep the total node count
 * manageable in the browser (~800 nodes max).
 */
export async function getGraphData({
  country,
  ownershipType,
  limit = 60,
  estPerGroup = 15,
}: {
  country?: string
  ownershipType?: string
  limit?: number
  estPerGroup?: number
}): Promise<GraphGroup[]> {
  const groups = await prisma.group.findMany({
    where: {
      nbEstablishments: { gt: 0 },
      ...(country       && { country: country as any }),
      ...(ownershipType && { ownershipType: ownershipType as any }),
    },
    orderBy: { nbEstablishments: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      ownershipType: true,
      country: true,
      nbEstablishments: true,
      establishments: {
        select: { id: true, name: true, type: true, city: true },
        orderBy: { dataQualityScore: 'desc' },
        take: estPerGroup,
      },
    },
  })

  return groups
}
