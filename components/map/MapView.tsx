'use client'

import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

export interface MapMarker {
  id: string
  name: string
  city: string
  type: string
  lat: number
  lng: number
  approximate?: boolean // true = derived from dept centroid
}

const TYPE_COLORS: Record<string, string> = {
  LONG_TERM_CARE: '#D97706',
  ACUTE_CARE:     '#DC2626',
  MENTAL_HEALTH:  '#7C3AED',
  NEW_MEDICINE:   '#059669',
  PALLIATIVE:     '#6B7280',
  PRIMARY_CARE:   '#2563EB',
}

export function MapView({ markers }: { markers: MapMarker[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  useEffect(() => {
    if (!containerRef.current || !token) return

    let map: any

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      import('mapbox-gl/dist/mapbox-gl.css' as any)
      mapboxgl.accessToken = token

      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [2.35, 46.8],
        zoom: 5,
      })

      map.addControl(new mapboxgl.NavigationControl(), 'top-right')
      mapRef.current = map

      map.on('load', () => {
        markers.forEach(m => {
          const el = document.createElement('div')
          el.className = 'map-marker'
          el.style.cssText = `
            width: ${m.approximate ? '10px' : '12px'};
            height: ${m.approximate ? '10px' : '12px'};
            border-radius: 50%;
            background: ${TYPE_COLORS[m.type] ?? '#1B4FD8'};
            border: 2px solid white;
            box-shadow: 0 1px 4px rgba(0,0,0,.25);
            opacity: ${m.approximate ? '0.55' : '1'};
            cursor: pointer;
          `

          const popup = new mapboxgl.Popup({ offset: 12, closeButton: false })
            .setHTML(`
              <div style="font-family: system-ui; font-size: 13px; padding: 2px 0;">
                <strong style="display:block;margin-bottom:2px;">${m.name}</strong>
                <span style="color:#6b7280;">${m.city}</span>
                ${m.approximate ? '<br/><span style="color:#9ca3af;font-size:11px;">approx. location</span>' : ''}
              </div>
            `)

          new mapboxgl.Marker({ element: el })
            .setLngLat([m.lng, m.lat])
            .setPopup(popup)
            .addTo(map)
        })
      })
    })

    return () => { map?.remove() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, markers.length])

  if (!token) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-3 text-center px-6">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <MapPin size={22} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-600">Map not configured</p>
        <p className="text-xs text-gray-400 max-w-xs">
          Add <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to your{' '}
          <code className="bg-gray-100 px-1 rounded">.env</code> to enable the map view.
        </p>
        {markers.length > 0 && (
          <p className="text-xs text-gray-400">{markers.length.toLocaleString()} establishments would be shown</p>
        )}
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-full" />
}
