'use client'

import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

interface Props {
  lat: number
  lng: number
  name: string
  approximate?: boolean
}

export function EstablishmentMap({ lat, lng, name, approximate }: Props) {
  const ref   = useRef<HTMLDivElement>(null)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  useEffect(() => {
    if (!ref.current || !token) return
    let map: any

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      mapboxgl.accessToken = token
      map = new mapboxgl.Map({
        container: ref.current!,
        style:     'mapbox://styles/mapbox/light-v11',
        center:    [lng, lat],
        zoom:      approximate ? 9 : 13,
        interactive: true,
      })
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
      map.on('load', () => {
        new mapboxgl.Marker({ color: '#1B4FD8' })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup({ closeButton: false }).setText(name))
          .addTo(map)
      })
    })

    return () => map?.remove()
  }, [token, lat, lng, name, approximate])

  if (!token) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 gap-2 text-sm rounded-xl">
        <MapPin size={16} />
        <span>Add NEXT_PUBLIC_MAPBOX_TOKEN to enable map</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={ref} className="w-full h-full rounded-xl overflow-hidden" />
      {approximate && (
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-xs text-gray-500 px-2 py-1 rounded-md shadow-sm border border-gray-100">
          Approx. location (by department)
        </div>
      )}
    </div>
  )
}
