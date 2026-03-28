export interface IndexLevel {
  id: number
  indexLevelName: string
}

export interface Station {
  id: number
  stationName: string
  gegrLat: string
  gegrLon: string
  city: {
    id: number
    name: string
    commune: {
      communeName: string
      districtName: string
      provinceName: string
    }
  }
  addressStreet: string | null
}

export interface Sensor {
  id: number
  stationId: number
  param: {
    paramName: string
    paramFormula: string
    paramCode: string
    idParam: number
  }
}

export interface SensorData {
  key: string
  values: Array<{
    date: string
    value: number | null
  }>
}

export interface AirQualityIndex {
  id: number
  stCalcDate: string
  stIndexLevel: IndexLevel | null
  stSourceDataDate: string
  pm10IndexLevel: IndexLevel | null
  pm25IndexLevel: IndexLevel | null
  no2IndexLevel: IndexLevel | null
  so2IndexLevel: IndexLevel | null
  o3IndexLevel: IndexLevel | null
  coIndexLevel: IndexLevel | null
  c6h6IndexLevel: IndexLevel | null
}
