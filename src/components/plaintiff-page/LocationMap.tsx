'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPinIcon } from '@heroicons/react/24/outline'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

// [lng, lat]
const CITY_COORDS: Record<string, [number, number]> = {
  'brisbane':        [153.0251, -27.4698],
  'melbourne':       [144.9631, -37.8136],
  'sydney':          [151.2093, -33.8688],
  'perth':           [115.8605, -31.9505],
  'gold coast':      [153.4000, -28.0167],
  'australia':       [133.7751, -25.2744],
  'thailand':        [100.9925,  15.8700],
  'bangkok':         [100.5018,  13.7563],
  'dubai':           [ 55.2962,  25.2048],
  'uae':             [ 53.8478,  23.4241],
  'abu dhabi':       [ 54.3773,  24.4539],
  'vietnam':         [108.2772,  14.0583],
  'ho chi minh':     [106.6297,  10.8231],
  'saigon':          [106.6297,  10.8231],
  'hanoi':           [105.8342,  21.0278],
  'china':           [104.1954,  35.8617],
  'beijing':         [116.4074,  39.9042],
  'shanghai':        [121.4737,  31.2304],
  'hong kong':       [114.1694,  22.3193],
  'singapore':       [103.8198,   1.3521],
  'new york':        [-74.0059,  40.7128],
  'los angeles':     [-118.2437, 34.0522],
  'london':          [ -0.1278,  51.5074],
  'paris':           [  2.3522,  48.8566],
  'berlin':          [ 13.4050,  52.5200],
  'toronto':         [-79.3832,  43.6532],
  'tokyo':           [139.6917,  35.6895],
}

function resolveCoords(name: string, coords?: [number, number]): [number, number] | null {
  if (coords) return coords  // already [lng, lat]
  const key = name.toLowerCase()
  for (const [city, c] of Object.entries(CITY_COORDS)) {
    if (key.includes(city)) return c
  }
  return null
}

interface Location {
  name: string
  date: string
  description: string
  coordinates?: [number, number]
}

interface ResolvedPoint {
  loc: Location
  coords: [number, number]  // [lng, lat]
  index: number
}

interface LocationMapProps {
  locations: Location[]
}

function MapCanvas({ resolvedPoints }: { resolvedPoints: ResolvedPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current || resolvedPoints.length === 0 || mapRef.current) return

    const init = async () => {
      // Dynamic import — keeps Leaflet out of SSR bundle
      const L = (await import('leaflet')).default

      // Inject Leaflet CSS once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id   = 'leaflet-css'
        link.rel  = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Leaflet uses [lat, lng] — flip our [lng, lat] storage
      const latLngs = resolvedPoints.map(p => [p.coords[1], p.coords[0]] as [number, number])

      // Compute bounds
      const lats = latLngs.map(c => c[0])
      const lngs = latLngs.map(c => c[1])
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lats) - 5, Math.min(...lngs) - 5],
        [Math.max(...lats) + 5, Math.max(...lngs) + 5],
      ]

      const map = L.map(containerRef.current!, {
        zoomControl:       true,
        attributionControl: false,
      }).fitBounds(bounds, { padding: [40, 40] })

      mapRef.current = map

      // CARTO Voyager — full color, high detail, no API key required
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19 }
      ).addTo(map)

      // Trail polyline
      if (latLngs.length >= 2) {
        // Glow layer
        L.polyline(latLngs, {
          color:   '#818cf8',
          weight:  8,
          opacity: 0.18,
          interactive: false,
        }).addTo(map)
        // Dashed line
        L.polyline(latLngs, {
          color:       '#a5b4fc',
          weight:      2,
          opacity:     0.85,
          dashArray:   '8 6',
          interactive: false,
        }).addTo(map)
      }

      // Pulse-ring keyframes injected once
      if (!document.getElementById('map-pulse-css')) {
        const style = document.createElement('style')
        style.id = 'map-pulse-css'
        style.textContent = `
          @keyframes mapPulse {
            0%   { transform: scale(1);   opacity: 0.6 }
            100% { transform: scale(2.2); opacity: 0   }
          }
          .leaflet-popup-content-wrapper {
            background: rgba(10,10,30,0.96) !important;
            border: 1px solid rgba(99,102,241,0.35) !important;
            border-radius: 10px !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
            color: white !important;
          }
          .leaflet-popup-tip {
            background: rgba(10,10,30,0.96) !important;
          }
          .leaflet-popup-close-button {
            color: rgba(165,180,252,0.6) !important;
            font-size: 16px !important;
          }
        `
        document.head.appendChild(style)
      }

      // Numbered markers + popups
      resolvedPoints.forEach(({ loc, index }, i) => {
        const delay = i * 0.3
        const html = `
          <div style="
            width:34px;height:34px;border-radius:50%;
            background:linear-gradient(135deg,#4f46e5,#7c3aed);
            border:2px solid rgba(165,180,252,0.7);
            display:flex;align-items:center;justify-content:center;
            font-weight:700;font-size:13px;color:white;
            cursor:pointer;position:relative;
            box-shadow:0 0 14px rgba(99,102,241,0.7);
            font-family:system-ui,sans-serif;
          ">
            ${index + 1}
            <div style="
              position:absolute;inset:-6px;border-radius:50%;
              border:2px solid rgba(99,102,241,0.35);
              animation:mapPulse 2.2s ease-out ${delay}s infinite;
              pointer-events:none;
            "></div>
          </div>
        `
        const icon = L.divIcon({ html, className: '', iconSize: [34, 34], iconAnchor: [17, 17] })

        const popup = L.popup({ offset: [0, -17] }).setContent(`
          <div style="font-family:system-ui,sans-serif;padding:2px">
            <div style="font-weight:700;font-size:13px;color:#e0e7ff;margin-bottom:3px">${loc.name}</div>
            <div style="font-size:11px;color:rgba(165,180,252,0.8);margin-bottom:4px">${loc.date}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.75);max-width:200px;line-height:1.4">${loc.description}</div>
          </div>
        `)

        L.marker([latLngs[i][0], latLngs[i][1]], { icon }).bindPopup(popup).addTo(map)
      })

      setLoaded(true)
    }

    init().catch(err => {
      console.warn('Map initialization failed:', err)
    })

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      // Leaflet leaves _leaflet_id on the DOM node — clear it so React StrictMode
      // double-invoke doesn't hit "Map container is already initialized"
      if (containerRef.current) {
        delete (containerRef.current as any)._leaflet_id
      }
    }
  }, [resolvedPoints])

  return (
    <div className="relative rounded-xl overflow-hidden h-[400px] md:h-[654px]">
      <div ref={containerRef} className="w-full h-full" />

      {!loaded && (
        <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
            <span className="text-white/40 text-sm">Loading map…</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function LocationMap({ locations }: LocationMapProps) {
  const [mapVisible, setMapVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Lazy-init — only mount map when section enters viewport
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setMapVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!locations || locations.length === 0) return null

  const resolvedPoints: ResolvedPoint[] = locations
    .map((loc, index) => {
      const coords = resolveCoords(loc.name, loc.coordinates)
      return coords ? { loc, coords, index } : null
    })
    .filter(Boolean) as ResolvedPoint[]

  if (resolvedPoints.length === 0) return null

  return (
    <motion.section
      ref={sectionRef as any}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="py-16 px-6"
    >
      <div className="max-w-[1340px] mx-auto">
        <h2 className="text-[38px] font-semibold mb-2 text-white">Fraud Trail</h2>
        <p className="text-sm text-white/40 mb-8">
          Tracking the path of deception across {resolvedPoints.length} location{resolvedPoints.length !== 1 ? 's' : ''}
        </p>

        {/* Interactive map */}
        {mapVisible && <MapCanvas resolvedPoints={resolvedPoints} />}

        {/* Location cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {resolvedPoints.map(({ loc, index }) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-300">{index + 1}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <MapPinIcon className="h-3 w-3 text-indigo-400 shrink-0" />
                  <span className="text-sm font-semibold text-white truncate">{loc.name}</span>
                  <span className="text-[10px] text-white/40 ml-auto shrink-0">{loc.date}</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{loc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
