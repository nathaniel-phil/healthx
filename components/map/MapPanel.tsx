import { getEstablishments } from '@/lib/db/establishments'
import { MapView, type MapMarker } from './MapView'

// Approximate centroids per French department code
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
  '971':[-61.55,16.17],'972':[-60.98,14.64],'973':[-53.13,3.93],
  '974':[55.53,-21.11],'976':[45.15,-12.78],
}

// Add small random jitter so overlapping dept-level pins are visible
function jitter(val: number): number {
  return val + (Math.random() - 0.5) * 0.15
}

interface Props {
  searchParams: Record<string, string | undefined>
}

export async function MapPanel({ searchParams }: Props) {
  const { items } = await getEstablishments({
    q:           searchParams.q,
    country:     searchParams.country as any,
    type:        searchParams.type as any,
    legalStatus: searchParams.legalStatus as any,
    ownership:   searchParams.ownership as any,
    signal:      searchParams.signal as any,
    department:  searchParams.department,
    minBeds:     searchParams.minBeds ? Number(searchParams.minBeds) : undefined,
    maxBeds:     searchParams.maxBeds ? Number(searchParams.maxBeds) : undefined,
    pageSize:    500,
  })

  const markers: MapMarker[] = items.flatMap(e => {
    if (e.lat && e.lng) {
      return [{ id: e.id, name: e.name, city: e.city, type: e.type, lat: e.lat, lng: e.lng }]
    }
    const dept = e.department?.trim() ?? ''
    const coords = DEPT_CENTROIDS[dept]
    if (!coords) return []
    return [{
      id: e.id, name: e.name, city: e.city, type: e.type,
      lat: jitter(coords[1]),
      lng: jitter(coords[0]),
      approximate: true,
    }]
  })

  return <MapView markers={markers} />
}
