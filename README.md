# EcoMonitor — Air Quality Dashboard

**Live:** https://eco-monitor-gold.vercel.app

An interactive air quality dashboard for Poland, built with React 18 and TypeScript. Displays real-time data from the GIOŚ (Chief Inspectorate of Environmental Protection) monitoring network across all stations in Poland.

## Features

- **Interactive map** — all ~500 GIOŚ stations with AQI-colored markers, clustering by worst air quality, geolocation button, and flyTo on city search
- **Top 5 lists** — most polluted and cleanest stations for the selected pollutant
- **Station detail page** — sensor selector, 6h/12h/24h time range, pollutant chart, WHO norm comparison bar chart, weather widget, and sortable data table
- **Compare page** — side-by-side PM2.5 comparison for up to 3 stations (chart + per-pollutant table)
- **Favorites** — save stations, persisted to localStorage
- **Dark mode** — respects system preference on first visit, togglable
- **Responsive** — desktop sidebar + mobile slide-in drawer

## Tech Stack

| | |
|---|---|
| Framework | React 18 + Vite + TypeScript (strict) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Map | react-leaflet + react-leaflet-cluster |
| Data fetching | TanStack Query v5 |
| State | Zustand with persist |
| Routing | React Router v6 |
| Dates | date-fns |

## Data Sources

- **[GIOŚ API v1](https://api.gios.gov.pl/pjp-api/v1/rest/)** — station list, sensors, measurements, AQI index (no key required)
- **[Open-Meteo](https://open-meteo.com/)** — current weather per station coordinates (no key required)

## Getting Started

```bash
npm install
npm run dev
```

The dev server proxies GIOŚ and Open-Meteo API calls to avoid CORS issues in the browser.

```bash
npm run build   # production build
npm run lint    # ESLint
```
