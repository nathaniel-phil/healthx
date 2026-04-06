/**
 * Seeds the database with sample data for local development.
 * Run: npm run db:seed
 */

import { prisma } from '../lib/prisma'

async function main() {
  console.log('Seeding database…')

  // Create sample groups
  const korian = await prisma.group.upsert({
    where:  { id: 'korian' },
    create: { id: 'korian', name: 'Korian', country: 'FR', hqCity: 'Paris', nbEstablishments: 312, totalBeds: 33000, ownershipType: 'LISTED', website: 'https://www.korian.com' },
    update: {},
  })

  const orpea = await prisma.group.upsert({
    where:  { id: 'orpea' },
    create: { id: 'orpea', name: 'ORPEA', country: 'FR', hqCity: 'Puteaux', nbEstablishments: 255, totalBeds: 28000, ownershipType: 'LISTED', website: 'https://www.orpea.com' },
    update: {},
  })

  const domusvi = await prisma.group.upsert({
    where:  { id: 'domusvi' },
    create: { id: 'domusvi', name: 'DomusVi', country: 'FR', hqCity: 'Paris', nbEstablishments: 280, totalBeds: 29000, ownershipType: 'PE_BACKED' },
    update: {},
  })

  // Create sample establishments
  const establishments = [
    {
      id: 'est-001', finessId: '750100012',
      name: 'Résidence Les Acacias', type: 'LONG_TERM_CARE' as const,
      country: 'FR' as const, city: 'Paris', region: 'Île-de-France', address: '12 Rue de la Paix, 75001 Paris',
      lat: 48.8698, lng: 2.3308, beds: 84, legalStatus: 'PRIVATE_FOR_PROFIT' as const,
      ownershipType: 'GROUP' as const, groupId: korian.id, dataQualityScore: 85,
    },
    {
      id: 'est-002', finessId: '690100034',
      name: 'Clinique du Parc', type: 'ACUTE_CARE' as const,
      country: 'FR' as const, city: 'Lyon', region: 'Auvergne-Rhône-Alpes', address: '155 Boulevard Stalingrad, 69006 Lyon',
      lat: 45.7640, lng: 4.8357, beds: 120, legalStatus: 'PRIVATE_FOR_PROFIT' as const,
      ownershipType: 'INDEPENDENT' as const, dataQualityScore: 72,
    },
    {
      id: 'est-003', finessId: '130100056',
      name: 'EHPAD Saint-Exupéry', type: 'LONG_TERM_CARE' as const,
      country: 'FR' as const, city: 'Marseille', region: "Provence-Alpes-Côte d'Azur", address: '45 Avenue du Prado, 13008 Marseille',
      lat: 43.2696, lng: 5.3956, beds: 96, legalStatus: 'ASSOCIATION' as const,
      ownershipType: 'INDEPENDENT' as const, dataQualityScore: 65,
    },
    {
      id: 'est-004', finessId: '310100078',
      name: 'Centre de Soins Palliatifs La Sérénité', type: 'PALLIATIVE' as const,
      country: 'FR' as const, city: 'Toulouse', region: 'Occitanie', address: '3 Rue du Languedoc, 31000 Toulouse',
      lat: 43.6047, lng: 1.4442, beds: 20, legalStatus: 'PRIVATE_NON_PROFIT' as const,
      ownershipType: 'INDEPENDENT' as const, dataQualityScore: 55,
    },
    {
      id: 'est-005', finessId: '330100099',
      name: 'Maison de Santé Bordeaux-Chartrons', type: 'PRIMARY_CARE' as const,
      country: 'FR' as const, city: 'Bordeaux', region: 'Nouvelle-Aquitaine', address: '28 Quai des Chartrons, 33000 Bordeaux',
      lat: 44.8515, lng: -0.5726, legalStatus: 'ASSOCIATION' as const,
      ownershipType: 'INDEPENDENT' as const, dataQualityScore: 60,
    },
    {
      id: 'est-006', finessId: '590100123',
      name: 'Clinique de la Mitterie', type: 'MENTAL_HEALTH' as const,
      country: 'FR' as const, city: 'Lomme', region: 'Hauts-de-France', address: '270 Rue du Général de Gaulle, 59160 Lomme',
      lat: 50.6439, lng: 2.9778, beds: 60, legalStatus: 'PRIVATE_FOR_PROFIT' as const,
      ownershipType: 'GROUP' as const, groupId: orpea.id, dataQualityScore: 78,
    },
    {
      id: 'est-007', finessId: '670100145',
      name: 'Longevity Center Strasbourg', type: 'NEW_MEDICINE' as const,
      country: 'FR' as const, city: 'Strasbourg', region: 'Grand Est', address: '10 Rue des Frères, 67000 Strasbourg',
      lat: 48.5734, lng: 7.7521, legalStatus: 'PRIVATE_FOR_PROFIT' as const,
      ownershipType: 'INDEPENDENT' as const, dataQualityScore: 50,
    },
    {
      id: 'est-008', finessId: '440100167',
      name: 'EHPAD Les Jardins de l\'Océan', type: 'LONG_TERM_CARE' as const,
      country: 'FR' as const, city: 'Nantes', region: 'Pays de la Loire', address: '5 Boulevard de l\'Océan, 44000 Nantes',
      lat: 47.2184, lng: -1.5536, beds: 110, legalStatus: 'PRIVATE_FOR_PROFIT' as const,
      ownershipType: 'GROUP' as const, groupId: domusvi.id, dataQualityScore: 82,
    },
  ]

  for (const est of establishments) {
    await prisma.establishment.upsert({
      where:  { id: est.id },
      create: { ...est, lastUpdated: new Date() },
      update: {},
    })
  }

  // Signals
  await prisma.signal.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'sig-001', establishmentId: 'est-001', type: 'NEW_DIRECTOR',
        description: 'Marie-Claire Dubois appointed as new Director General in January 2024.',
        detectedAt: new Date('2024-01-15'),
      },
      {
        id: 'sig-002', establishmentId: 'est-002', type: 'BUILDING_PERMIT',
        description: 'Building permit filed for 30-bed extension of the surgical wing.',
        sourceUrl: 'https://www.geoportail-urbanisme.gouv.fr',
        detectedAt: new Date('2024-03-20'),
      },
      {
        id: 'sig-003', establishmentId: 'est-003', type: 'FINANCIAL_STRESS',
        description: 'BODACC filing: sauvegarde procedure opened. Legal proceedings ongoing.',
        sourceUrl: 'https://www.bodacc.fr',
        detectedAt: new Date('2024-02-10'),
      },
      {
        id: 'sig-004', establishmentId: 'est-006', type: 'TENDER',
        description: 'Public tender published for medical equipment supply (2024-2026 contract).',
        sourceUrl: 'https://www.marches-publics.gouv.fr',
        detectedAt: new Date('2024-04-05'),
      },
      {
        id: 'sig-005', establishmentId: 'est-008', type: 'ACQUISITION',
        description: 'DomusVi acquired Les Jardins de l\'Océan from independent operator in Q1 2024.',
        detectedAt: new Date('2024-01-30'),
      },
    ],
  })

  // Contacts
  await prisma.contact.createMany({
    skipDuplicates: true,
    data: [
      { id: 'con-001', establishmentId: 'est-001', firstName: 'Marie-Claire', lastName: 'Dubois', title: 'Directrice Générale', seniority: 'C_LEVEL', source: 'linkedin' },
      { id: 'con-002', establishmentId: 'est-001', firstName: 'Thomas', lastName: 'Martin', title: 'Responsable Achats', seniority: 'MANAGER', source: 'pappers' },
      { id: 'con-003', establishmentId: 'est-002', firstName: 'Dr Jean-Paul', lastName: 'Renard', title: 'Directeur Médical', seniority: 'DIRECTOR', source: 'linkedin' },
      { id: 'con-004', establishmentId: 'est-006', firstName: 'Sophie', lastName: 'Laurent', title: 'Directrice Administrative', seniority: 'DIRECTOR', source: 'pappers' },
    ],
  })

  console.log('Seed complete.')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
