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

  const input = name.toLowerCase().trim()
  if (!input) return null

  // Try parsing as "lat, lng" or "lat,lng" coordinates
  const coordMatch = input.match(/^([-\d.]+)\s*,\s*([-\d.]+)$/)
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1])
    const lng = parseFloat(coordMatch[2])
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [lng, lat]  // return as [lng, lat]
    }
  }

  // Try extracting from Google Maps URL (e.g., maps.google.com/?q=13.7,100.5)
  const mapsMatch = input.match(/[?&]q=([-\d.]+)[,+]([-\d.]+)/)
  if (mapsMatch) {
    const lat = parseFloat(mapsMatch[1])
    const lng = parseFloat(mapsMatch[2])
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [lng, lat]
    }
  }

  // Fall back to city name lookup
  for (const [city, c] of Object.entries(CITY_COORDS)) {
    if (input.includes(city)) return c
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
  const [initFailed, setInitFailed] = useState(false)

  useEffect(() => {
    if (!containerRef.current || resolvedPoints.length === 0 || initFailed) return

    // Only initialize if map doesn't exist
    if (mapRef.current) return

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

      // Compute tight bounds around actual points
      const lats = latLngs.map(c => c[0])
      const lngs = latLngs.map(c => c[1])
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLng = Math.min(...lngs)
      const maxLng = Math.max(...lngs)

      // Calculate the spread of points
      const latSpread = maxLat - minLat
      const lngSpread = maxLng - minLng

      // Adaptive buffer: if points are very close (same city), use smaller buffer
      // If points are spread out (worldwide), use proportionally larger buffer
      const bufferFactor = Math.max(latSpread, lngSpread) < 1 ? 0.15 : 0.05
      const latBuffer = Math.max(latSpread * bufferFactor, 0.01)
      const lngBuffer = Math.max(lngSpread * bufferFactor, 0.01)

      const bounds: [[number, number], [number, number]] = [
        [minLat - latBuffer, minLng - lngBuffer],
        [maxLat + latBuffer, maxLng + lngBuffer],
      ]

      const map = L.map(containerRef.current!, {
        zoomControl:       true,
        attributionControl: false,
      }).fitBounds(bounds, { padding: [50, 50], maxZoom: 18 })

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
      // Suppress "already initialized" errors from React.StrictMode
      if (err.message?.includes('already initialized')) {
        setInitFailed(true)
        return
      }
      console.warn('Map initialization failed:', err)
    })

    return () => {
      // Complete Leaflet destruction — required for React.StrictMode development
      if (mapRef.current) {
        try {
          // Stop all map interactions
          mapRef.current.dragging?.disable()
          mapRef.current.touchZoom?.disable()
          mapRef.current.doubleClickZoom?.disable()
          mapRef.current.scrollWheelZoom?.disable()
          mapRef.current.boxZoom?.disable()
          mapRef.current.keyboard?.disable()
          mapRef.current.tap?.disable()
          mapRef.current.off()
          mapRef.current.remove()
        } catch (err) {
          // Ignore any errors during cleanup
        }
        mapRef.current = null
      }

      // Nuclear option: completely reset container for React.StrictMode
      if (containerRef.current) {
        const el = containerRef.current as any
        // Remove ALL Leaflet cruft
        Object.keys(el).forEach(key => {
          if (key.startsWith('_leaflet') || key.startsWith('leaflet'))
            delete el[key]
        })
        // Reset innerHTML and all inline styles
        el.innerHTML = ''
        el.style.cssText = ''
        // Force remove any left-over Leaflet divs
        el.querySelectorAll('.leaflet-container').forEach((child: any) => {
          try { child.remove() } catch {}
        })
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

  // PERMANENT FIX: Preserve ALL locations with their actual coordinates
  // - Multiple events in same city = multiple markers (if they have different lat/long)
  // - Same city, same coordinates = one marker (deduplicated)
  // - Different coordinates = always shown separately with their unique index number
  const allResolvedPoints: ResolvedPoint[] = locations
    .map((loc, index) => {
      const coords = resolveCoords(loc.name, loc.coordinates)
      return coords ? { loc, coords, index } : null
    })
    .filter(Boolean) as ResolvedPoint[]

  // Deduplicate: if multiple events have EXACT same coordinates, keep only first
  // This prevents marker stacking at same spot
  const coordKey = (coords: [number, number]) => `${coords[0].toFixed(4)},${coords[1].toFixed(4)}`
  const seenCoords = new Set<string>()
  const resolvedPoints: ResolvedPoint[] = allResolvedPoints.filter(point => {
    const key = coordKey(point.coords)
    if (seenCoords.has(key)) return false
    seenCoords.add(key)
    return true
  })

  if (resolvedPoints.length === 0) return null

  return (
    <motion.section
      ref={sectionRef as any}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="px-6 pt-[8px] pb-[120px]"
    >
      <div className="max-w-[1340px] mx-auto">
        <h2 className="text-[38px] font-semibold mb-2 text-white">Fraud Trail</h2>
        <p className="text-sm text-white/40 mb-8">
          Tracking the path of deception across {resolvedPoints.length} location{resolvedPoints.length !== 1 ? 's' : ''}
        </p>

        {/* Interactive map */}
        {mapVisible && <MapCanvas resolvedPoints={resolvedPoints} />}
      </div>
    </motion.section>
  )
}
