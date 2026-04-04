"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoAlbersUsa, geoPath, geoCentroid } from "d3-geo";
import { useRef } from "react";
// ─── Palette ──────────────────────────────────────────────────────────────────
// darkGreen:  #386641
// midGreen:   #6A994E
// lime:       #A7C957
// ivory:      #F2E8CF  ← primary background
// red:        #BC4749  ← alerts / bad AQI

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ClimateData {
  aqi?: number;
  category?: string;
  pollutant?: string;
  // expand as you add APIs
}

interface ClickedPoint {
  lat: number;
  lng: number;
  label: string;
  data: ClimateData | null;
  loading: boolean;
  error: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function fetchClimateData(lat: number, lng: number): Promise<ClimateData> {
  const res = await fetch(`/api/aqi?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error("Could not fetch data for this location.");
  return res.json();
}

function aqiColor(aqi?: number): string {
  if (!aqi) return "#6A994E";
  if (aqi <= 50) return "#6A994E";
  if (aqi <= 100) return "#A7C957";
  if (aqi <= 150) return "#f59e0b";
  if (aqi <= 200) return "#f97316";
  return "#BC4749";
}

function aqiLabel(aqi?: number): string {
  if (!aqi) return "—";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for sensitive groups";
  if (aqi <= 200) return "Unhealthy";
  return "Hazardous";
}

// ─── DataCard ─────────────────────────────────────────────────────────────────
function DataCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1 bg-white"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <p className="text-xs uppercase tracking-widest" style={{ color: "#6A994E" }}>
        {label}
      </p>
      <p className="text-3xl font-semibold" style={{ color: "#386641" }}>
        {value}
      </p>
      {sub && (
        <p className="text-sm" style={{ color: "#6A994E" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── SidePanel ────────────────────────────────────────────────────────────────
function SidePanel({ point }: { point: ClickedPoint | null }) {
  if (!point) {
    return (
      <aside className="w-80 flex flex-col items-center justify-center p-8 gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: "#A7C957" }}
        >
          🌿
        </div>
        <p className="text-center text-sm leading-relaxed" style={{ color: "#6A994E" }}>
          Click a state to explore real-time climate data for that region.
        </p>
      </aside>
    );
  }

  return (
    <aside className="w-80 flex flex-col gap-5 p-6 overflow-y-auto">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: "#386641" }}>
          {point.label}
        </h2>
        <p className="text-xs mt-1 font-mono" style={{ color: "#6A994E" }}>
          {point.lat.toFixed(4)}°N · {Math.abs(point.lng).toFixed(4)}°W
        </p>
      </div>

      <div className="h-px" style={{ background: "#A7C957", opacity: 0.4 }} />

      {point.loading && (
        <div className="flex items-center gap-2" style={{ color: "#6A994E" }}>
          <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span className="text-sm">Fetching data…</span>
        </div>
      )}

      {point.error && (
        <p
          className="text-sm rounded-lg p-3"
          style={{ background: "#fef2f2", color: "#BC4749" }}
        >
          {point.error}
        </p>
      )}

      {point.data && !point.loading && (
        <div className="flex flex-col gap-3">
          <DataCard
            label="Air Quality Index"
            value={point.data.aqi ?? "—"}
            sub={aqiLabel(point.data.aqi)}
            accent={aqiColor(point.data.aqi)}
          />
          {/* TODO: add more cards as you wire APIs */}
          {/* <DataCard label="Drought Level" value={} sub={} accent="#f59e0b" /> */}
          {/* <DataCard label="Active Fires" value={} sub={} accent="#BC4749" /> */}
        </div>
      )}

      {point.data && !point.loading && (
        <>
          <div className="h-px" style={{ background: "#A7C957", opacity: 0.4 }} />
          <div
            className="rounded-xl p-4 text-sm leading-relaxed"
            style={{ background: "#EDF5E0", color: "#386641" }}
          >
            <p className="font-medium mb-1">What you can do</p>
            <p className="text-xs" style={{ color: "#6A994E" }}>
              {/* TODO: wire AI summary here */}
              AI-generated local action suggestions will appear here.
            </p>
          </div>
        </>
      )}
    </aside>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClimateMap() {
  const [point, setPoint] = useState<ClickedPoint | null>(null);
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);

  async function handleStateClick(geo: any, e: React.MouseEvent) {
    const name = geo.properties.name;

    // To get the exact clicked coordinates regardless of screen size/stretching:
    // 1. Get the raw SVG element being rendered by react-simple-maps
    const svg = mapRef.current?.querySelector("svg");
    if (!svg) return;

    // 2. Convert DOM screen pixels (e.clientX/Y) into SVG internal coordinates (0..800, 0..600 scale)
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    // 3. Take the SVG coordinates and invert them through D3's map projection magic 
    // to find the true Lat/Lng of that exact mouse tip!
    const coords = projection.invert!([svgP.x, svgP.y]);
    if (!coords) return; // safety catch if clicking perfectly on an edge

    const [realLng, realLat] = coords;
    
    setLatitude(realLat);
    setLongitude(realLng);

    setPoint({ label: name, lat: realLat, lng: realLng, data: null, loading: true, error: null });

    try {
      const data = await fetchClimateData(realLat, realLng);
      setPoint((prev) => prev && { ...prev, data, loading: false });
    } catch (e: any) {
      setPoint((prev) => prev && { ...prev, loading: false, error: e.message });
    }
  }
const mapRef = useRef<HTMLDivElement>(null);
// We match react-simple-maps' exact internal defaults for the "geoAlbersUsa" projection:
const projection = geoAlbersUsa().scale(1070).translate([400, 300]);

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: "#F2E8CF", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-8 py-4 border-b"
        style={{ background: "#F2E8CF", borderColor: "#A7C957" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌎</span>
          <div>
            <h1 className="text-lg font-semibold leading-none" style={{ color: "#386641" }}>
            placeholder
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#6A994E" }}>
              placeholder
            </p>
          </div>
        </div>

        {/* AQI Legend */}
        <div className="flex items-center gap-4 text-xs" style={{ color: "#6A994E" }}>
          {[
            { color: "#6A994E", label: "Good" },
            { color: "#A7C957", label: "Moderate" },
            { color: "#f59e0b", label: "Unhealthy" },
            { color: "#BC4749", label: "Hazardous" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <main className="flex-1 relative overflow-hidden">
          <div ref={mapRef} className="absolute inset-0">
          <ComposableMap
            projection="geoAlbersUsa"
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isSelected = point?.label === geo.properties.name;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={(e) => handleStateClick(geo, e)}
                      style={{
                        default: {
                          fill: isSelected ? "#386641" : "#6A994E",
                          stroke: "#F2E8CF",
                          strokeWidth: 1.2,
                          outline: "none",
                        },
                        hover: {
                          fill: "#386641",
                          stroke: "#F2E8CF",
                          strokeWidth: 1.2,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: { fill: "#386641", outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
            {point && projection([point.lng, point.lat]) &&  (
             
              <Marker coordinates={[point.lng, point.lat]}>
                <circle r={6} fill="#BC4749" stroke="#F2E8CF" strokeWidth={2} />
              </Marker>
            )}
          </ComposableMap>
          </div>
        </main>

        <div className="w-px" style={{ background: "#A7C957", opacity: 0.5 }} />

        <SidePanel point={point} />
      </div>
    </div>
  );
}
