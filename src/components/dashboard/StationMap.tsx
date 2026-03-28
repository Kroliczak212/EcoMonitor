import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Link } from 'react-router-dom'
import type { Station, AirQualityIndex } from '@/types/gios'
import { Badge } from '@/components/ui/Badge'
import { getMarkerColor, getLevelNameForPollutant } from '@/utils/aqiHelpers'
import { useAppStore } from '@/store/useAppStore'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// AQI level → numeric severity (higher = worse)
const LEVEL_SEVERITY: Record<string, number> = {
  'Bardzo dobry': 0,
  'Dobry': 1,
  'Umiarkowany': 2,
  'Dostateczny': 3,
  'Zły': 4,
  'Bardzo zły': 5,
}

// Embed level name in icon HTML so cluster function can read it
function createMarkerIcon(color: string, levelName: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div
      data-level="${levelName}"
      style="
        width:14px;height:14px;border-radius:50%;
        background:${color};
        border:2.5px solid white;
        box-shadow:0 1px 5px rgba(0,0,0,0.4);
      "
    ></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  })
}

interface MarkerCluster {
  getChildCount: () => number
  getAllChildMarkers: () => L.Marker[]
}

// Custom cluster icon — color = worst AQI among children
function createClusterIcon(cluster: MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount()

  // Find worst AQI level among child markers
  const children = cluster.getAllChildMarkers()
  let worstSeverity = -1
  let worstColor = '#6b7280'

  for (const marker of children) {
    const html = (marker.getIcon() as L.DivIcon).options.html as string
    const match = html.match(/data-level="([^"]*)"/)
    const level = match?.[1] ?? ''
    const severity = LEVEL_SEVERITY[level] ?? -1
    if (severity > worstSeverity) {
      worstSeverity = severity
      worstColor = getMarkerColor(level)
    }
  }

  const size = count < 10 ? 34 : count < 50 ? 40 : 48
  const fontSize = count < 10 ? 13 : count < 100 ? 12 : 11

  return L.divIcon({
    className: '',
    html: `<div style="
      position:relative;
      width:${size}px;height:${size}px;
    ">
      <!-- outer ring -->
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:${worstColor};
        opacity:0.25;
      "></div>
      <!-- inner circle -->
      <div style="
        position:absolute;inset:4px;border-radius:50%;
        background:${worstColor};
        border:2px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        color:white;
        font-weight:700;
        font-size:${fontSize}px;
        font-family:system-ui,-apple-system,sans-serif;
        line-height:1;
      ">${count}</div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function MapController({ focusStation }: { focusStation: Station | null }) {
  const map = useMap()
  useEffect(() => {
    if (!focusStation) return
    const lat = parseFloat(focusStation.gegrLat)
    const lon = parseFloat(focusStation.gegrLon)
    if (!isNaN(lat) && !isNaN(lon)) map.flyTo([lat, lon], 12, { duration: 1.2 })
  }, [focusStation, map])
  return null
}

function GeolocateButton() {
  const map = useMap()
  const [geoError, setGeoError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  const handleClick = () => {
    setGeoError(null)
    if (!navigator.geolocation) {
      setGeoError('Geolokalizacja niedostępna w tej przeglądarce')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, { duration: 1.2 })
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Brak uprawnień do lokalizacji')
        } else if (err.code === err.TIMEOUT) {
          setGeoError('Przekroczono czas oczekiwania')
        } else {
          setGeoError('Nie udało się pobrać lokalizacji')
        }
        if (timerRef.current !== null) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setGeoError(null), 3000)
      },
      { timeout: 8000 }
    )
  }

  return (
    <>
      <div className="leaflet-top leaflet-right mt-2.5 mr-2.5">
        <div className="leaflet-control leaflet-bar">
          <button
            onClick={handleClick}
            title="Moja lokalizacja"
            className="flex items-center justify-center w-[30px] h-[30px] bg-white border-none cursor-pointer text-[15px]"
          >
            📍
          </button>
        </div>
      </div>
      {geoError && (
        <div className="leaflet-bottom leaflet-left mb-2.5 ml-2.5">
          <div className="leaflet-control bg-red-50 border border-red-300 rounded-lg px-3 py-1.5 text-xs text-red-600 pointer-events-none">
            {geoError}
          </div>
        </div>
      )}
    </>
  )
}

interface StationMapProps {
  stations: Station[]
  aqiMap: Record<number, AirQualityIndex | null>
  focusStation?: Station | null
  onStationSelect?: (station: Station) => void
}

export const StationMap = ({
  stations,
  aqiMap,
  focusStation = null,
  onStationSelect,
}: StationMapProps) => {
  const selectedPollutant = useAppStore((s) => s.selectedPollutant)
  const theme = useAppStore((s) => s.theme)

  if (stations.length === 0) {
    return <div className="w-full h-[500px] rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
  }

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-sm z-0">
      <MapContainer center={[52.0, 19.5]} zoom={6} className="w-full h-full" scrollWheelZoom>
        <TileLayer
          key={theme}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={
            theme === 'dark'
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          }
        />
        <MapController focusStation={focusStation} />
        <GeolocateButton />

        <MarkerClusterGroup
          iconCreateFunction={createClusterIcon}
          showCoverageOnHover={false}
          maxClusterRadius={60}
          spiderfyOnMaxZoom
          chunkedLoading
        >
          {stations.map((station) => {
            const lat = parseFloat(station.gegrLat)
            const lon = parseFloat(station.gegrLon)
            if (isNaN(lat) || isNaN(lon)) return null

            const aqi = aqiMap[station.id]
            const levelName =
              getLevelNameForPollutant(aqi, selectedPollutant) ??
              aqi?.stIndexLevel?.indexLevelName ??
              ''
            const color = getMarkerColor(levelName)

            return (
              <Marker
                key={station.id}
                position={[lat, lon]}
                icon={createMarkerIcon(color, levelName)}
                eventHandlers={{ click: () => onStationSelect?.(station) }}
              >
                <Popup>
                  <div className="min-w-[170px] space-y-1.5">
                    <p className="font-bold text-gray-900 text-sm">{station.city.name}</p>
                    <p className="text-xs text-gray-500">{station.stationName}</p>
                    {station.addressStreet && (
                      <p className="text-xs text-gray-400">{station.addressStreet}</p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-gray-500">{selectedPollutant}:</span>
                      <Badge level={levelName || undefined} size="sm" />
                    </div>
                    <Link
                      to={`/station/${station.id}`}
                      className="block text-xs text-green-600 hover:text-green-700 hover:underline mt-2 font-medium"
                    >
                      Szczegóły →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}
