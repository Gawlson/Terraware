"use client";

import { useState , useEffect} from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoAlbersUsa } from "d3-geo";
import { useRef } from "react";
import { TClimateData, TAirQualityData, TFireEventData } from "../types";
import { fetchDroughtData, fetchFireData } from "../app/actions";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point as turfpoint } from "@turf/helpers";
import SidePanel from "./SidePanel";
import ActionModal from "./ActionModal";
import { getEndangeredSpecies } from "../api/EndangeredSpecies";
import { DroughtData } from "../api/DroughtData";
// ─── Palette ──────────────────────────────────────────────────────────────────
// darkGreen:  #386641
// midGreen:   #6A994E
// lime:       #A7C957
// ivory:      #F2E8CF  ← primary background
// red:        #BC4749  ← alerts / bad AQI
//f77f00

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// ─── Types ────────────────────────────────────────────────────────────────────


interface ClickedPoint {
  lat: number;
  lng: number;
  label: string;
  data: TClimateData | null;
  loading: boolean;
  error: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────




// ─── Main ─────────────────────────────────────────────────────────────────────
type ClimateProps = {
  fetchdata: (latitudenum: number, longitudenum: number) => Promise<TClimateData>,
  
}
export default function ClimateMap({ fetchdata }: ClimateProps) {
  // Stores the clicked location, fetched AQI data payload, and loading/error states for Explore mode
  const [point, setPoint] = useState<ClickedPoint | null>(null);
  const [stateGeo, setStateGeo] = useState<any|null>();
  // Controls whether the single red dot (explore mode marker) is rendered on the map
  const [displayExplore, setDisplayExplore] = useState(true)
  // Tracks multi-selected states in Fire mode, storing each state's name and its associated high-confidence fire data for the Side Panel
  const [fireStates, setFireStates] =  useState<{stateName :string, statefires :TFireEventData[]}[]>([]);
  // A visual toggle to keep Fire mode states highlighted/filled when they are selected
  const [displayFire, setDisplayFire] = useState(false);
  //active mode 
  const [mode, setMode] = useState('explore')
  // all wildfire occurrences fetched from the API globally on initial load
  const [allFires, setAllFires] = useState<TFireEventData[]>([]);
  // Holds the calculated subset of fire events that geographically intersect with the selected states (used to plot individual fire dots)
  const[firesInState, setFiresInState] = useState<TFireEventData[]>([])
const [speciesData, setSpeciesData] = useState<any[]>([])
const [displayAnimalData, setDisplayAnimalData] = useState(false)
const [stateDroughtData, setStateDroughtData] = useState<{
  avgDroughtLevel: number;
  severity: {
    label: string;
    color: string;
  };
} | null>(null);

const[displayAIModal, setDisplayAIModal] = useState(false)
const handleOnCloseModal = () =>{
  setDisplayAIModal(false)
}
useEffect(() => {
  fetchFireData().then(setAllFires);
  
}, []);
 // console.log(allFires);
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [loading, setLoading] = useState(false);

 
  const getFiresInGeo = (geo : any) =>{
     const filteredFires = allFires.filter((fire)=>(
    booleanPointInPolygon(
    turfpoint([Number(fire.longitude), Number(fire.latitude)]),
    geo
  )
 
  
)

  )
  return filteredFires
    
  }
  const handleSetMode =(m :any) =>{
    setMode(m);
    if(m === "explore"){
      setDisplayFire(false)
      setDisplayExplore(true);
      setDisplayAnimalData(false)
    }
    else if(m==='fire'){
      setDisplayFire(true)
      setDisplayExplore(false);
      setDisplayAnimalData(false)
    }
    else if(m === 'wildlife'){
          setDisplayFire(false)
      setDisplayExplore(false);
      setDisplayAnimalData(true )
    }
  }
  async function handleStateClick(geo: any, e: React.MouseEvent) {

    if (mode === "fire") {

  const filteredFires = getFiresInGeo(geo);

   const confidentFilteredFires = filteredFires.filter(f => f.confidence === "h" || f.confidence === "n")
    setFireStates((prev) =>
    prev.some((s) => s.stateName === geo.properties.name)
      ? prev.filter((s) => s.stateName !== geo.properties.name) // deselect
      : [{stateName: geo.properties.name, statefires : confidentFilteredFires}, ...prev]     
                 // select
  );
  console.log("fires in state:", confidentFilteredFires.length, "of", allFires.length);
  setFiresInState(filteredFires);
 

  
} else {
  // your existing explore logic
  setStateGeo(geo)
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

    // 1. First, set loading to true and data to null so the UI updates to show a spinner immediately
    setPoint({ label: name, lat: realLat, lng: realLng, data: null, loading: true, error: null });
    setSpeciesData([]) // clear previous species to trigger the loading spinner
    setStateDroughtData(null) // clear previous drought data while the new state loads

    try {
      // 2. Call the passed-in "fetchdata" function with the coordinates and await the result
      const data = await fetchdata(realLat, realLng);
      setPoint((prev) => prev && { ...prev, data, loading: false });
    } catch (e: any) {
      setPoint((prev) => prev && { ...prev, loading: false, error: e.message });
    }
    const species =  await getEndangeredSpecies(name);
    setSpeciesData(species)
    try {
      const droughtdata = await fetchDroughtData(name);
      setStateDroughtData(droughtdata);
    } catch (e) {
      console.error("Drought data fetch failed:", e);
      setStateDroughtData(null);
    }
  }
  }
  const mapRef = useRef<HTMLDivElement>(null); 
  const projection = geoAlbersUsa().scale(1070).translate([400, 300]);
  const stateClimateData = point ? { state: point.label, droughtLevel : (stateDroughtData ? stateDroughtData.avgDroughtLevel : 0) , aqi: point.data?.airqualitydata?.aqi ?? 0 , fires:  getFiresInGeo(stateGeo).length, animals : speciesData.map((s: any) => s.commonName) } : null;
 

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: "#F2E8CF", fontFamily: "'DM Sans', sans-serif" }}
    >
      <ActionModal isOpen = {displayAIModal} onClose ={handleOnCloseModal} stateName = {point?.label} stateClimateData = {stateClimateData}></ActionModal>
      {/* Header */}
      <header
        className="flex items-center justify-between px-8 py-6 border-b"
        style={{ background: "#F2E8CF", borderColor: "#A7C957", paddingTop:"4px", paddingBottom: "4px" }}
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
          <div className="flex gap-2">
  {(["explore", "wildlife","fire"] as const).map((m) => (
    <button
      key={m}
      onClick={() => handleSetMode(m)}
      className="px-6 py-2 rounded-full text-sm font-medium transition-colors"
      style={{
        background: mode === m ? "#386641" : "transparent",
        color: mode === m ? "#F2E8CF" : "#6A994E",
        border: "1.5px solid #6A994E",
        padding : "6px",
      }}
    >
      {m === "explore" ? "Explore" : m === "wildlife" ? "Endangered Species" : "View Wildfires"}
    </button>
  ))}
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
                    const isFireState = fireStates.some(s => s.stateName === geo.properties.name);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={(e) => handleStateClick(geo, e)}
                        style={{
                          default: {
                            fill: ((isSelected && (displayExplore||displayAnimalData)) || (isFireState && displayFire)) ? "#386641" : "#6A994E",
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
              {mode === 'fire' && fireStates.map((firestate) => (
                firestate.statefires.map((fire, i) =>(
                   <Marker key={i} coordinates={[Number(fire.longitude), Number(fire.latitude)]}>
      <circle r={3} fill="#BC4749" fillOpacity={1} stroke="none" />
    </Marker>

                ))

   


  ))}
              {point && (displayExplore||displayAnimalData) && projection([point.lng, point.lat]) && (

                <Marker coordinates={[point.lng, point.lat]}>
                  <circle r={6} fill="#BC4749" stroke="#F2E8CF" strokeWidth={2} />
                </Marker>
              )}
            </ComposableMap>
          </div>
         
         
        </main>

        <div className="w-px" style={{ background: "#A7C957", opacity: 0.5 }} />
              
        <SidePanel setDisplayAIModal = {setDisplayAIModal} point={point} mode = {mode} firesinstate = {firesInState} Bfirestateselected = {fireStates.length>0} selectedstates = {fireStates} speciesdata = {speciesData} droughtdata={stateDroughtData} />
      </div>
    </div>
  );
}
// function aqiColor(aqi?: number): string {
//   if (!aqi) return "#6A994E";
//   if (aqi <= 50) return "#6A994E";
//   if (aqi <= 100) return "#A7C957";
//   if (aqi <= 150) return "#f59e0b";
//   if (aqi <= 200) return "#f97316";
//   return "#BC4749";
// }

// function aqiLabel(aqi?: number): string {
//   if (!aqi) return "—";
//   if (aqi <= 50) return "Good";
//   if (aqi <= 100) return "Moderate";
//   if (aqi <= 150) return "Unhealthy for sensitive groups";
//   if (aqi <= 200) return "Unhealthy";
//   return "Hazardous";
// }

// ─── DataCard ─────────────────────────────────────────────────────────────────
// function DataCard({
//   label,
//   value,
//   sub,
//   accent,
// }: {
//   label: string;
//   value: string | number;
//   sub?: string;
//   accent: string;
// }) {
//   return (
//     <div
//       className="rounded-xl flex flex-col gap-1 bg-white shadow-sm"
//       style={{ 
//         borderLeft: `4px solid ${accent}`,
//         padding: "24px 28px" 
//       }}
//     >
//       <p className="text-xs uppercase tracking-widest" style={{ color: "#6A994E" }}>
//         {label}
//       </p>
//       <p className="text-3xl font-semibold" style={{ color: "#386641" }}>
//         {value}
//       </p>
//       {sub && (
//         <p className="text-sm" style={{ color: "#6A994E" }}>
//           {sub}
//         </p>
//       )}
//     </div>
//   );
// }

// ─── SidePanel ────────────────────────────────────────────────────────────────
// function SidePanel({ point, mode, firesinstate, Bfirestateselected ,selectedstates }: { point: ClickedPoint | null, mode: string, firesinstate: TFireEventData[], Bfirestateselected: boolean, selectedstates : {stateName:string, statefires : TFireEventData[]}[] }) {
//   if (!point && mode === 'explore') {
//     return (
//       <aside className="w-80 flex flex-col items-center justify-center p-8 gap-3">
//         <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "#A7C957" }}>
//           🌿
//         </div>
//         <p className="text-center text-sm leading-relaxed" style={{ color: "#6A994E" }}>
//           Click a state to explore real-time climate data for that region.
//         </p>
//       </aside>
//     );
//   }

//   if (mode === 'fire' && !Bfirestateselected) {
//     return (
//       <aside className="w-80 flex flex-col items-center justify-center p-8 gap-3">
//         <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "#BC4749" }}>
//           🔥
//         </div>
//         <p className="text-center text-sm leading-relaxed" style={{ color: "#6A994E" }}>
//           Select states to view real-time wildfire data.
//         </p>
//       </aside>
//     );
//   }

//   if (!point && mode !== 'fire') {
//     return (
//       <aside className="w-80 flex flex-col items-center justify-center p-8 gap-3">
//         <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "#A7C957" }}>
//           🌿
//         </div>
//         <p className="text-center text-sm leading-relaxed" style={{ color: "#6A994E" }}>
//           Click a state to explore real-time climate data for that region.
//         </p>
//       </aside>
//     );
//   }
//   let totalselectedfires = 0;
//  for (let i = 0; i< selectedstates.length; i++ ){
//     totalselectedfires += selectedstates[i].statefires.length
//  }
//   return (
//     <aside className="w-80 flex flex-col gap-5 p-6 overflow-y-auto">
//       <div>
//         <h2 className="text-xl font-semibold" style={{ color: "#386641" }}>
//           {mode === 'fire' ? 'Wildfire Data' : point?.label}
//         </h2>
//         <p className="text-xs mt-1 font-mono" style={{ color: "#6A994E" }}>
//           {mode === 'fire' ? `${totalselectedfires} fires detected` : `${point?.lat.toFixed(4)}°N · ${Math.abs(point?.lng ?? 0).toFixed(4)}°W`}
//         </p>
//       </div>

//       <div className="h-px" style={{ background: "#A7C957", opacity: 0.4 }} />

//       {mode === 'fire' ? (
     
     
//       <div className="flex flex-col items-center w-full">
//         <div className="flex flex-col gap-8 w-full max-w-[280px]">
//              {selectedstates?.map((state, index) => {
//   return (  
//     <div key={state.stateName} className="flex flex-col gap-8 w-full">
//     <div 
//       className="flex flex-col w-full gap-3 rounded-2xl shadow-md border-2"
//       style={{ 
//         backgroundColor: "#EDF5E0", 
//         borderColor: "#A7C957",
//         padding: "16px 24px" 
//       }}
//     >   
//           <h3 className="text-sm font-bold uppercase tracking-wider px-1" style={{ color: "#386641" }}>
//             {state.stateName}
//           </h3>
//           <DataCard
//             label="Total Active Fires"
//             value={state.statefires.length}
//             sub="Detected in last 24hrs"
//             accent="#BC4749"
//           />
//           <DataCard
//             label="High Confidence"
//             value={state.statefires.filter(f => f.confidence === "h").length}
//             sub="High confidence detections"
//             accent="#BC4749"
//           />
//           <DataCard
//             label="Daytime Fires"
//             value={state.statefires.filter(f => f.daynight === "D").length}
//             sub="Detected during daylight"
//             accent="#f59e0b"
//           />
//     </div>
//     {index < selectedstates.length - 1 && (
//       <div className="h-px w-full" style={{ background: "#A7C957", opacity: 0.4 }} />
//     )}
//     </div>
//   );
// })}
//         </div>
//       </div>

//       ) : (
//         <>
//           {point?.loading && (
//             <div className="flex items-center gap-2" style={{ color: "#6A994E" }}>
//               <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
//               <span className="text-sm">Fetching data…</span>
//             </div>
//           )}

//           {point?.error && (
//             <p className="text-sm rounded-lg p-3" style={{ background: "#fef2f2", color: "#BC4749" }}>
//               {point.error}
//             </p>
//           )}

//           {point?.data && !point.loading && (
//             <div className="flex flex-col gap-3">
//               <DataCard
//                 label="Air Quality Index"
//                 value={point.data.airqualitydata?.aqi ?? "—"}
//                 sub={`${aqiLabel(point.data.airqualitydata?.aqi)} ${point.data.airqualitydata?.dateObserved
//                   ? `(Observed: ${point.data.airqualitydata.dateObserved.trim()})`
//                   : "Sorry! No data available"
//                 }`}
//                 accent={aqiColor(point.data.airqualitydata?.aqi)}
//               />
//             </div>
//           )}
//         </>
//       )}

//       <div className="h-px" style={{ background: "#A7C957", opacity: 0.4 }} />
//       <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: "#EDF5E0", color: "#386641" }}>
//         <p className="font-medium mb-1">What you can do</p>
//         <p className="text-xs" style={{ color: "#6A994E" }}>
//           AI-generated local action suggestions will appear here.
//         </p>
//       </div>
//     </aside>
//   );
// }