"use client";

import { useState , useEffect} from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoAlbersUsa } from "d3-geo";
import { useRef } from "react";
import { TClimateData, TAirQualityData, TFireEventData } from "../types";
import { fetchFireData } from "../app/actions";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point as turfpoint } from "@turf/helpers";
import DataCard from "./DataCard";
import { IUCN_COLORS, IUCN_LABELS } from "../lib/species-data";

interface ClickedPoint {
  lat: number;
  lng: number;
  label: string;
  data: TClimateData | null;
  loading: boolean;
  error: string | null;
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
export default function SidePanel({ point, mode, firesinstate, Bfirestateselected ,selectedstates, speciesdata }: 
    { point: ClickedPoint | null, mode: string,
         firesinstate: TFireEventData[], Bfirestateselected: boolean, 
         selectedstates : {stateName:string, statefires : TFireEventData[]}[],
        speciesdata : any[] }){
  if (!point && mode === 'explore') {
    return (
      <aside className="w-80 flex flex-col items-center justify-center p-8 gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "#A7C957" }}>
          🌿
        </div>
        <p className="text-center text-sm leading-relaxed" style={{ color: "#6A994E" }}>
          Click a state to explore real-time climate data for that region.
        </p>
      </aside>
    );
  }

  if (mode === 'fire' && !Bfirestateselected) {
    return (
      <aside className="w-80 flex flex-col items-center justify-center p-8 gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "#BC4749" }}>
          🔥
        </div>
        <p className="text-center text-sm leading-relaxed" style={{ color: "#6A994E" }}>
          Select states to view real-time wildfire data.
        </p>
      </aside>
    );
  }

  if (!point && mode === 'wildlife') {
    return (
      <aside className="w-80 flex flex-col items-center justify-center p-8 gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "#917041" }}>
          🐾
        </div>
        <p className="text-center text-sm leading-relaxed" style={{ color: "#6A994E" }}>
          Click a state to learn about the endangered species in the area.
        </p>
      </aside>
    );
  }
  
  let totalselectedfires = 0;
 for (let i = 0; i< selectedstates.length; i++ ){
    totalselectedfires += selectedstates[i].statefires.length
 }


return (
    <aside className="w-80 flex flex-col gap-5 p-6 overflow-y-auto">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: "#386641" }}>
          {mode === 'fire' ? 'Wildfire Data' : mode === 'wildlife' ? 'Wildlife' : point?.label}
        </h2>
        <p className="text-xs mt-1 font-mono" style={{ color: "#6A994E" }}>
          {mode === 'fire' ? `${totalselectedfires} fires detected` : mode === 'wildlife' ? 'Endangered species in this state' : `${point?.lat?.toFixed(4)}°N · ${Math.abs(point?.lng ?? 0).toFixed(4)}°W`}
        </p>
      </div>

      <div className="h-px" style={{ background: "#A7C957", opacity: 0.4 }} />

      {mode === 'fire' ? (
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-col gap-8 w-full max-w-[280px]">
            {selectedstates?.map((state, index) => {
              return (
                <div key={state.stateName} className="flex flex-col gap-8 w-full">
                  <div
                    className="flex flex-col w-full gap-3 rounded-2xl shadow-md border-2"
                    style={{
                      backgroundColor: "#EDF5E0",
                      borderColor: "#A7C957",
                      padding: "16px 24px"
                    }}
                  >
                    <h3 className="text-sm font-bold uppercase tracking-wider px-1" style={{ color: "#386641" }}>
                      {state.stateName}
                    </h3>
                    <DataCard
                      label="Total Active Fires"
                      value={state.statefires.length}
                      sub="Detected in last 24hrs"
                      accent="#BC4749"
                    />
                    <DataCard
                      label="High Confidence"
                      value={state.statefires.filter(f => f.confidence === "h").length}
                      sub="High confidence detections"
                      accent="#BC4749"
                    />
                    <DataCard
                      label="Daytime Fires"
                      value={state.statefires.filter(f => f.daynight === "D").length}
                      sub="Detected during daylight"
                      accent="#f59e0b"
                    />
                  </div>
                  {index < selectedstates.length - 1 && (
                    <div className="h-px w-full" style={{ background: "#A7C957", opacity: 0.4 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

      ) : mode === 'wildlife' ? (
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-col gap-8 w-full max-w-[280px]">
            <div 
              className="flex flex-col w-full gap-3 rounded-2xl shadow-md border-2"
              style={{ 
                backgroundColor: "#EDF5E0", 
                borderColor: "#A7C957",
                padding: "16px 24px" 
              }}
            >
              <h3 className="text-sm font-bold uppercase tracking-wider px-1" style={{ color: "#386641" }}>
                Identified Species
              </h3>
              {speciesdata?.length > 0 ? speciesdata.map((s, index) => (
                <div key={s.commonName} className="flex flex-col gap-3 w-full">
                  <DataCard
                    label={s.commonName}
                    value={
                      <span style={{ color: IUCN_COLORS[s.iucn] || "#BC4749" }}>
                        {IUCN_LABELS[s.iucn] || s.iucn}
                      </span>
                    }
                    sub={s.scientificName}
                    accent="#917041"
                  />
                </div>
              )) : (
                <p className="text-sm px-1 py-2" style={{ color: "#6A994E" }}>
                   {point?.label ? `Analyzing data for ${point.label}...` : "Click a state to see endangered species."}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (

        <>
          {point?.loading && (
            <div className="flex items-center gap-2" style={{ color: "#6A994E" }}>
              <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              <span className="text-sm">Fetching data…</span>
            </div>
          )}

          {point?.error && (
            <p className="text-sm rounded-lg p-3" style={{ background: "#fef2f2", color: "#BC4749" }}>
              {point.error}
            </p>
          )}

          {point?.data && !point.loading && (
            <div className="flex flex-col gap-3">
              <DataCard
                label="Air Quality Index"
                value={point.data.airqualitydata?.aqi ?? "—"}
                sub={`${aqiLabel(point.data.airqualitydata?.aqi)} ${point.data.airqualitydata?.dateObserved
                  ? `(Observed: ${point.data.airqualitydata.dateObserved.trim()})`
                  : "Sorry! No data available"
                }`}
                accent={aqiColor(point.data.airqualitydata?.aqi)}
              />
            </div>
          )}
        </>

      )}

      <div className="h-px" style={{ background: "#A7C957", opacity: 0.4 }} />
      <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: "#EDF5E0", color: "#386641" }}>
        <p className="font-medium mb-1">What you can do</p>
        <p className="text-xs" style={{ color: "#6A994E" }}>
          AI-generated local action suggestions will appear here.
        </p>
      </div>
    </aside>
  );
}