/**
 * Import FINESS data into PostgreSQL.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/import-finess.ts [path-to-csv]
 *
 * Defaults to: data/etalab-cs1100507-stock-20260311-0343 (1).csv
 *
 * Column layout (0-indexed, etalab CS1100507 semicolon format, Latin-1 encoding):
 *  0  record type            must equal "structureet"
 *  1  finess_juridique       legal entity FINESS (not used as ID)
 *  2  finess_et              establishment FINESS  → finessId  ← unique key
 *  3  rs                     short name            → name (fallback)
 *  4  rslongue               long name             → name (preferred)
 *  7  numvoie                street number         ┐
 *  8  typvoie                street type           ├─ address
 *  9  voie                   street name           ┘
 * 13  departement            dept code (01–976)    → department
 * 15  ligneacheminement      "01440 VIRIAT"        → postalCode + city
 * 16  telephone                                    → phone
 * 18  categetab              category code         → type (see CAT_TO_TYPE)
 * 19  libcategetab           category label        → subtype
 * 26  codesph                public/private code   → legalStatus (see STATUT_TO_LEGAL)
 * 30  datemaj                last update date      → lastUpdated
 */

import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { join } from 'path'
import { prisma } from '../lib/prisma'
import type { EstablishmentType, LegalStatus } from '@prisma/client'

const DEFAULT_CSV = join(__dirname, '../data/etalab-cs1100507-stock-20260311-0343 (1).csv')
const BATCH_SIZE  = 200

// ─── Mappers ─────────────────────────────────────────────────────────────────

// categetab code → EstablishmentType
// Verified against the actual file (see: awk -F';' '{print $19";"$20}' | uniq -c)
const CAT_TO_TYPE: Record<string, EstablishmentType> = {
  // Long-term care / residential
  '500': 'LONG_TERM_CARE',  // EHPAD
  '354': 'LONG_TERM_CARE',  // SSIAD
  '202': 'LONG_TERM_CARE',  // Résidence autonomie
  '255': 'LONG_TERM_CARE',  // MAS
  '382': 'LONG_TERM_CARE',  // Foyer de vie adultes handicapés
  '448': 'LONG_TERM_CARE',  // Étab. acc. médicalisé personnes handicapées
  '449': 'LONG_TERM_CARE',  // Étab. acc. non médicalisé personnes handicapées
  '446': 'LONG_TERM_CARE',  // SAVS
  '445': 'LONG_TERM_CARE',  // SAMSAH
  '460': 'LONG_TERM_CARE',  // Service autonomie aide (SAA)
  '462': 'LONG_TERM_CARE',  // Lieux de vie et d'accueil

  // Mental health
  '292': 'MENTAL_HEALTH',   // CHS maladies mentales
  '156': 'MENTAL_HEALTH',   // CMP
  '425': 'MENTAL_HEALTH',   // CATTP
  '182': 'MENTAL_HEALTH',   // SESSAD
  '183': 'MENTAL_HEALTH',   // IME
  '186': 'MENTAL_HEALTH',   // ITEP
  '188': 'MENTAL_HEALTH',   // Institut déficients auditifs
  '189': 'MENTAL_HEALTH',   // Institut déficients visuels

  // Primary / community care
  '124': 'PRIMARY_CARE',    // Centre de santé
  '603': 'PRIMARY_CARE',    // Maison de santé (L.6223-3)
  '604': 'PRIMARY_CARE',    // CPTS
  '223': 'PRIMARY_CARE',    // PMI
  '230': 'PRIMARY_CARE',    // Consultation protection infantile
}

// codesph (col 26) → LegalStatus
// Actual codes found in the file: 1, 6, 7, 2, 3, 0, 9 (blank = not applicable)
const STATUT_TO_LEGAL: Record<string, LegalStatus> = {
  '1': 'PUBLIC',             // Établissement public de santé
  '6': 'PRIVATE_NON_PROFIT', // ESPIC
  '7': 'PRIVATE_NON_PROFIT', // Privé non lucratif non ESPIC
  '2': 'PRIVATE_NON_PROFIT', // PSPH par intégration
  '3': 'PRIVATE_NON_PROFIT', // PSPH par concession
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** "01440 VIRIAT" → { postalCode: "01440", city: "VIRIAT" } */
function parseAddressLine(raw: string): { postalCode: string | null; city: string } {
  const m = raw.trim().match(/^(\d{5})\s+(.+)$/)
  if (m) return { postalCode: m[1], city: m[2] }
  return { postalCode: null, city: raw.trim() || 'INCONNU' }
}

/** Rebuilds a street address from FINESS parts, e.g. "900 RTE DE PARIS" */
function buildAddress(...parts: (string | undefined)[]): string | null {
  const addr = (parts as string[]).map(p => p?.trim()).filter(Boolean).join(' ')
  return addr || null
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const filePath = process.argv[2] ?? DEFAULT_CSV

  console.log('Starting FINESS import…')
  console.log(`Source: ${filePath}\n`)

  const rl = createInterface({
    // FINESS files from data.gouv.fr are Latin-1 (ISO-8859-1), not UTF-8
    input: createReadStream(filePath, { encoding: 'latin1' }),
    crlfDelay: Infinity,
  })

  let lineNum  = 0
  let imported = 0
  let skipped  = 0
  let batch: Parameters<typeof prisma.establishment.upsert>[0][] = []

  const flush = async () => {
    if (batch.length === 0) return
    await prisma.$transaction(batch.map(args => prisma.establishment.upsert(args)))
    imported += batch.length
    batch = []
    process.stdout.write(`\r  → ${imported.toLocaleString()} records imported…`)
  }

  for await (const line of rl) {
    lineNum++
    if (lineNum === 1) continue // first line is file metadata, not column names

    const cols = line.split(';')

    // Only process establishment rows with a valid FINESS ET identifier
    const finessId = cols[2]?.trim()  // col 2 = finess_et (establishment), NOT col 1 (legal entity)
    if (!finessId || cols[0]?.trim() !== 'structureet') { skipped++; continue }

    const name = cols[4]?.trim() || cols[3]?.trim()
    if (!name) { skipped++; continue }

    const { postalCode, city } = parseAddressLine(cols[15] ?? '')
    const catCode    = cols[18]?.trim()
    const statutCode = cols[26]?.trim()  // col 26 = codesph (codes: 1, 6, 7…), NOT col 20

    const address    = buildAddress(cols[7], cols[8], cols[9])
    const department = cols[13]?.trim() || null
    const phone      = cols[16]?.trim() || null
    const legalStatus = STATUT_TO_LEGAL[statutCode ?? ''] ?? undefined
    const lastUpdated = cols[30]?.trim() ? new Date(cols[30].trim()) : new Date()

    batch.push({
      where: { finessId },
      create: {
        finessId,
        name,
        type:        CAT_TO_TYPE[catCode ?? ''] ?? 'ACUTE_CARE', // default: acute, not primary
        subtype:     cols[19]?.trim() || null,
        country:     'FR',
        city,
        postalCode,
        address,
        department,
        phone,
        legalStatus,
        lastUpdated,
        dataQualityScore: 30,
      },
      update: {
        name,
        city,
        postalCode,
        address,
        department,
        phone,
        legalStatus,
        lastUpdated,
      },
    })

    if (batch.length >= BATCH_SIZE) await flush()
  }

  await flush()
  console.log(`\n\nDone.`)
  console.log(`  Imported : ${imported.toLocaleString()}`)
  console.log(`  Skipped  : ${skipped.toLocaleString()}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
