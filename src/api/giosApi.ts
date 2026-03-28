import type { Station, Sensor, SensorData, AirQualityIndex, IndexLevel } from '@/types/gios'

const BASE_URL = '/api/gios'

// ─── Raw API types (v1 — Polish field names) ────────────────────────────────

interface RawStation {
  'Identyfikator stacji': number
  'Kod stacji': string
  'Nazwa stacji': string
  'WGS84 φ N': string
  'WGS84 λ E': string
  'Identyfikator miasta': number
  'Nazwa miasta': string
  'Gmina': string
  'Powiat': string
  'Województwo': string
  'Ulica': string | null
}

interface RawSensor {
  'Identyfikator stanowiska': number
  'Identyfikator stacji': number
  'Wskaźnik': string
  'Wskaźnik - wzór': string
  'Wskaźnik - kod': string
  'Id wskaźnika': number
}

interface RawDataEntry {
  'Kod stanowiska': string
  'Data': string
  'Wartość': number | null
}

interface RawAqIndex {
  'Identyfikator stacji pomiarowej': number
  'Data wykonania obliczeń indeksu': string
  'Wartość indeksu': number | null
  'Nazwa kategorii indeksu': string | null
  // Per-pollutant — note API typo: "wskażnika" (not "wskaźnika") in category name keys
  'Wartość indeksu dla wskaźnika SO2': number | null
  'Nazwa kategorii indeksu dla wskażnika SO2': string | null
  'Wartość indeksu dla wskaźnika NO2': number | null
  'Nazwa kategorii indeksu dla wskażnika NO2': string | null
  'Wartość indeksu dla wskaźnika PM10': number | null
  'Nazwa kategorii indeksu dla wskażnika PM10': string | null
  'Wartość indeksu dla wskaźnika PM2.5': number | null
  'Nazwa kategorii indeksu dla wskażnika PM2.5': string | null
  'Wartość indeksu dla wskaźnika O3': number | null
  'Nazwa kategorii indeksu dla wskażnika O3': string | null
  'Wartość indeksu dla wskaźnika CO': number | null
  'Nazwa kategorii indeksu dla wskażnika CO': string | null
  'Wartość indeksu dla wskaźnika C6H6': number | null
  'Nazwa kategorii indeksu dla wskażnika C6H6': string | null
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function makeIndexLevel(id: number | null, name: string | null): IndexLevel | null {
  if (id === null || name === null) return null
  return { id, indexLevelName: name }
}

function mapStation(raw: RawStation): Station {
  return {
    id: raw['Identyfikator stacji'],
    stationName: raw['Nazwa stacji'],
    gegrLat: raw['WGS84 φ N'],
    gegrLon: raw['WGS84 λ E'],
    city: {
      id: raw['Identyfikator miasta'],
      name: raw['Nazwa miasta'],
      commune: {
        communeName: raw['Gmina'],
        districtName: raw['Powiat'],
        provinceName: raw['Województwo'],
      },
    },
    addressStreet: raw['Ulica'],
  }
}

function mapSensor(raw: RawSensor): Sensor {
  return {
    id: raw['Identyfikator stanowiska'],
    stationId: raw['Identyfikator stacji'],
    param: {
      paramName: raw['Wskaźnik'],
      paramFormula: raw['Wskaźnik - wzór'],
      paramCode: raw['Wskaźnik - kod'],
      idParam: raw['Id wskaźnika'],
    },
  }
}

function mapAqi(raw: RawAqIndex): AirQualityIndex {
  return {
    id: raw['Identyfikator stacji pomiarowej'],
    stCalcDate: raw['Data wykonania obliczeń indeksu'],
    stSourceDataDate: raw['Data wykonania obliczeń indeksu'],
    stIndexLevel: makeIndexLevel(raw['Wartość indeksu'], raw['Nazwa kategorii indeksu']),
    so2IndexLevel: makeIndexLevel(
      raw['Wartość indeksu dla wskaźnika SO2'],
      raw['Nazwa kategorii indeksu dla wskażnika SO2']
    ),
    no2IndexLevel: makeIndexLevel(
      raw['Wartość indeksu dla wskaźnika NO2'],
      raw['Nazwa kategorii indeksu dla wskażnika NO2']
    ),
    pm10IndexLevel: makeIndexLevel(
      raw['Wartość indeksu dla wskaźnika PM10'],
      raw['Nazwa kategorii indeksu dla wskażnika PM10']
    ),
    pm25IndexLevel: makeIndexLevel(
      raw['Wartość indeksu dla wskaźnika PM2.5'],
      raw['Nazwa kategorii indeksu dla wskażnika PM2.5']
    ),
    o3IndexLevel: makeIndexLevel(
      raw['Wartość indeksu dla wskaźnika O3'],
      raw['Nazwa kategorii indeksu dla wskażnika O3']
    ),
    coIndexLevel: makeIndexLevel(
      raw['Wartość indeksu dla wskaźnika CO'] ?? null,
      raw['Nazwa kategorii indeksu dla wskażnika CO'] ?? null
    ),
    c6h6IndexLevel: makeIndexLevel(
      raw['Wartość indeksu dla wskaźnika C6H6'] ?? null,
      raw['Nazwa kategorii indeksu dla wskażnika C6H6'] ?? null
    ),
  }
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

export async function fetchStations(): Promise<Station[]> {
  const res = await fetch(`${BASE_URL}/station/findAll?size=500`)
  if (!res.ok) throw new Error('Błąd pobierania listy stacji')
  const json = (await res.json()) as { 'Lista stacji pomiarowych': RawStation[] }
  const list = json['Lista stacji pomiarowych']
  if (!Array.isArray(list)) throw new Error('Nieoczekiwany format danych stacji')
  return list.map(mapStation)
}

export async function fetchSensors(stationId: number): Promise<Sensor[]> {
  const res = await fetch(`${BASE_URL}/station/sensors/${stationId}?size=100`)
  if (!res.ok) {
    if (res.status === 400) {
      const json = await res.json().catch(() => ({})) as { error_code?: string }
      if (json.error_code) return []
    }
    throw new Error('Błąd pobierania sensorów')
  }
  const json = (await res.json()) as {
    'Lista stanowisk pomiarowych dla podanej stacji': RawSensor[]
    error_code?: string
  }
  if (json.error_code) return []
  const list = json['Lista stanowisk pomiarowych dla podanej stacji']
  if (!Array.isArray(list)) throw new Error('Nieoczekiwany format danych sensorów')
  return list.map(mapSensor)
}

export async function fetchSensorData(sensorId: number): Promise<SensorData> {
  const res = await fetch(`${BASE_URL}/data/getData/${sensorId}?size=100`)
  if (!res.ok) {
    // Manual stations return 400 with API-ERR-100003 — treat as no data available
    if (res.status === 400) {
      const json = await res.json().catch(() => ({})) as { error_code?: string }
      if (json.error_code) return { key: '', values: [] }
    }
    throw new Error('Błąd pobierania danych sensora')
  }
  const json = (await res.json()) as { 'Lista danych pomiarowych': RawDataEntry[] | null; error_code?: string }
  if (json.error_code) return { key: '', values: [] }
  const entries = json['Lista danych pomiarowych'] ?? []
  if (!Array.isArray(entries)) throw new Error('Nieoczekiwany format danych pomiarowych')
  // API returns newest-first — sort ascending for charts
  const sorted = [...entries].sort((a, b) => a['Data'].localeCompare(b['Data']))
  return {
    key: sorted[0]?.['Kod stanowiska'] ?? '',
    values: sorted.map((e) => ({ date: e['Data'], value: e['Wartość'] })),
  }
}

export async function fetchAirQualityIndex(stationId: number): Promise<AirQualityIndex> {
  const res = await fetch(`${BASE_URL}/aqindex/getIndex/${stationId}`)
  if (!res.ok) {
    if (res.status === 400) {
      const json = await res.json().catch(() => ({})) as { error_code?: string }
      if (json.error_code) throw new Error('Brak indeksu AQI dla tej stacji')
    }
    throw new Error('Błąd pobierania indeksu AQI')
  }
  const json = (await res.json()) as { AqIndex: RawAqIndex | null; error_code?: string }
  if (json.error_code) throw new Error('Brak indeksu AQI dla tej stacji')
  const raw = json['AqIndex']
  if (!raw) throw new Error('Brak danych indeksu AQI')
  return mapAqi(raw)
}
