import { prisma } from '@/lib/prisma'
import type { Country, Prisma } from '@prisma/client'

export type GroupWithCount = Prisma.GroupGetPayload<{
  select: {
    id: true; name: true; country: true; hqCity: true
    ownershipType: true; nbEstablishments: true; totalBeds: true
    website: true; description: true
  }
}>

export async function getGroups({
  q,
  country,
  page = 1,
  pageSize = 25,
}: {
  q?: string
  country?: Country
  page?: number
  pageSize?: number
}): Promise<{ items: GroupWithCount[]; total: number }> {
  const where: Prisma.GroupWhereInput = {
    ...(q && { name: { contains: q, mode: 'insensitive' } }),
    ...(country && { country }),
  }

  const select = {
    id: true, name: true, country: true, hqCity: true,
    ownershipType: true, nbEstablishments: true, totalBeds: true,
    website: true, description: true,
  } satisfies Prisma.GroupSelect

  const [items, total] = await Promise.all([
    prisma.group.findMany({
      where,
      select,
      orderBy: [{ nbEstablishments: 'desc' }, { name: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.group.count({ where }),
  ])

  return { items, total }
}

export type GroupDetail = Prisma.GroupGetPayload<{
  include: {
    contacts: true
    establishments: {
      select: {
        id: true; name: true; type: true; city: true; department: true
        region: true; country: true; beds: true; legalStatus: true
        dataQualityScore: true
      }
    }
  }
}>

export async function getGroup(id: string): Promise<GroupDetail | null> {
  return prisma.group.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { seniority: 'asc' } },
      establishments: {
        select: {
          id: true, name: true, type: true, city: true, department: true,
          region: true, country: true, beds: true, legalStatus: true,
          dataQualityScore: true,
        },
        orderBy: [{ dataQualityScore: 'desc' }, { name: 'asc' }],
      },
    },
  })
}
