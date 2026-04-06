/**
 * Import FINESS data into PostgreSQL.
 *
 * Usage:
 *   1. Download the full FINESS export from data.gouv.fr:
 *      https://www.data.gouv.fr/fr/datasets/finess-extraction-du-fichier-des-etablissements/
 *      → Download "etalab-cs1100507-stock-20XXXXXX-0515.csv" (geolocalised, ~200k rows)
 *
 *   2. Run:
 *      DATABASE_URL=... npx ts-node scripts/import-finess.ts ./finess.csv
 */

import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { prisma } from '../lib/prisma'
import type { EstablishmentType, LegalStatus } from '@prisma/client'

// FINESS categorie → our EstablishmentType mapping (partial, extend as needed)
const CAT_TO_TYPE: Record<string, EstablishmentType> = {
  '500': 'LONG_TERM_CARE',   // EHPAD
  '501': 'LONG_TERM_CARE',
  '207': 'ACUTE_CARE',       // Clinique MCO
  '355': 'MENTAL_HEALTH',    // CMP
  '370': 'MENTAL_HEALTH',    // CATTP
  '165': 'PRIMARY_CARE',     // Centre de santé
  '190': 'PRIMARY_CARE',     // Maison de santé
  '460': 'PALLIATIVE',       // USP
}

const STATUT_TO_LEGAL: Record<string, LegalStatus> = {
  '10': 'PUBLIC',
  '20': 'PUBLIC',
  '21': 'PUBLIC',
  '50': 'PRIVATE_NON_PROFIT',
  '51': 'PRIVATE_NON_PROFIT',
  '60': 'PRIVATE_FOR_PROFIT',
  '61': 'PRIVATE_FOR_PROFIT',
  '70': 'ASSOCIATION',
}

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: ts-node import-finess.ts <path-to-csv>')
    process.exit(1)
  }

  const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity })

  let lineNum = 0
  let imported = 0
  let skipped = 0
  const BATCH_SIZE = 500
  let batch: Parameters<typeof prisma.establishment.upsert>[0][] = []

  const flush = async () => {
    if (batch.length === 0) return
    await prisma.$transaction(
      batch.map(args => prisma.establishment.upsert(args))
    )
    imported += batch.length
    batch = []
    process.stdout.write(`\r  Imported ${imported} establishments…`)
  }

  for await (const line of rl) {
    lineNum++
    if (lineNum === 1) continue // header

    // FINESS CSV uses semicolons, UTF-8
    const cols = line.split(';')
    // Column order (etalab CS1100507):
    // 0=structureet, 1=nofinesset, 2=nofinessej, 3=rs, 4=rslongue,
    // 5=complrs, 6=compldistrib, 7=numvoie, 8=typvoie, 9=voie,
    // 10=compvoie, 11=lieuditbp, 12=commune, 13=departement, 14=libdepartement,
    // 15=ligneacheminement, 16=telephone, 17=telecopie, 18=categetab, 19=libcategetab,
    // 20=categorieagretab (juridique), 21=libcategorieagretab, 22=siret, 23=codeape,
    // 24=codemft, 25=libmft, 26=codesph, 27=libsph, 28=dateouv, 29=dateautor,
    // 30=dateautn, 31=numuai, 32=coordxet, 33=coordyet, 34=geolocalisation, 35=sourcegeoloc

    const finessId   = cols[1]?.trim()
    const name       = (cols[4]?.trim() || cols[3]?.trim())
    const address    = [cols[7], cols[8], cols[9]].filter(Boolean).map(s => s.trim()).join(' ')
    const city       = cols[15]?.trim().replace(/^\d{5}\s*/, '') || cols[12]?.trim()
    const postalCode = cols[15]?.trim().match(/^\d{5}/)?.[0]
    const department = cols[13]?.trim()
    const phone      = cols[16]?.trim()
    const catCode    = cols[18]?.trim()
    const statutCode = cols[20]?.trim()
    const lat        = parseFloat(cols[33]?.trim()) || undefined
    const lng        = parseFloat(cols[32]?.trim()) || undefined

    if (!finessId || !name) { skipped++; continue }

    const type = CAT_TO_TYPE[catCode] ?? 'PRIMARY_CARE'

    batch.push({
      where:  { finessId },
      create: {
        finessId, name, type,
        country:    'FR',
        city:       city || 'Unknown',
        address,
        postalCode,
        region:     department,
        department,
        phone,
        lat,
        lng,
        legalStatus: STATUT_TO_LEGAL[statutCode] ?? undefined,
        lastUpdated: new Date(),
        dataQualityScore: lat && lng ? 70 : 40,
      },
      update: {
        name, city: city || 'Unknown', address, lat, lng,
        legalStatus: STATUT_TO_LEGAL[statutCode] ?? undefined,
        lastUpdated: new Date(),
      },
    })

    if (batch.length >= BATCH_SIZE) await flush()
  }

  await flush()
  console.log(`\nDone. Imported: ${imported}, skipped: ${skipped}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
