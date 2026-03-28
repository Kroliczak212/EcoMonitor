export const queryKeys = {
  stations: () => ['stations'] as const,
  sensors: (stationId: number) => ['sensors', stationId] as const,
  sensorData: (sensorId: number) => ['sensorData', sensorId] as const,
  airQualityIndex: (stationId: number) => ['airQualityIndex', stationId] as const,
  weather: (lat: number, lon: number) => ['weather', lat, lon] as const,
}
