import { prisma } from '@/lib/prisma'
import type { Country, EstablishmentType, LegalStatus, OwnershipType, SignalType, Prisma } from '@prisma/client'

export type EstablishmentWithSignals = Prisma.EstablishmentGetPayload<{
  include: { signals: true; group: { select: { id: true; name: true } } }
}>

interface QueryParams {
  q?: string
  country?: Country
  type?: EstablishmentType
  legalStatus?: LegalStatus
  ownership?: OwnershipType
  signal?: SignalType
  department?: string
  minBeds?: number
  maxBeds?: number
  page?: number
  pageSize?: number
}

export async function getEstablishments({
  q,
  country,
  type,
  legalStatus,
  ownership,
  signal,
  department,
  minBeds,
  maxBeds,
  page = 1,
  pageSize = 25,
}: QueryParams): Promise<{ items: EstablishmentWithSignals[]; total: number }> {
  const where: Prisma.EstablishmentWhereInput = {
    ...(q && {
      OR: [
        { name:    { contains: q, mode: 'insensitive' } },
        { city:    { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ],
    }),
    ...(country     && { country }),
    ...(type        && { type }),
    ...(legalStatus && { legalStatus }),
    ...(ownership   && { ownershipType: ownership }),
    ...(signal      && { signals: { some: { type: signal } } }),
    ...(department  && { department: { contains: department, mode: 'insensitive' } }),
    ...(minBeds !== undefined && { beds: { gte: minBeds } }),
    ...(maxBeds !== undefined && { beds: { lte: maxBeds } }),
  }

  const [items, total] = await Promise.all([
    prisma.establishment.findMany({
      where,
      include: {
        signals: { orderBy: { detectedAt: 'desc' }, take: 3 },
        group:   { select: { id: true, name: true } },
      },
      orderBy: [{ dataQualityScore: 'desc' }, { name: 'asc' }],
      skip:  (page - 1) * pageSize,
      take:  pageSize,
    }),
    prisma.establishment.count({ where }),
  ])

  return { items, total }
}

export async function getEstablishment(id: string) {
  return prisma.establishment.findUnique({
    where: { id },
    include: {
      signals:  { orderBy: { detectedAt: 'desc' } },
      contacts: { orderBy: { seniority: 'asc' } },
      group:    true,
    },
  })
}
