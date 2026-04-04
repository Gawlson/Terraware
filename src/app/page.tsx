'use client'
import { useState, useRef, useMemo } from "react";
import Globe from "../components/Globe";
import ClimateMap from "../components/Map";
import SidePanel from "../components/SidePanel";
import Toolbar from "../components/Toolbar";
import { CLIMATE_EVENTS } from "../data/events";
import { ClimateEvent, EventType } from "../types";

export default function App() {
  const [selectedEvent, setSelectedEvent] = useState<ClimateEvent | null>(null);
  const [activeFilter, setActiveFilter] = useState<EventType | "all">("all");


  const filteredEvents = useMemo(() =>
    activeFilter === "all"
      ? CLIMATE_EVENTS
      : CLIMATE_EVENTS.filter(e => e.type === activeFilter),
    [activeFilter]
  );



  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#030810",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'DM Sans', sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
        <div style={{ flex: 1, position: "relative" }}>
  
          <ClimateMap />

  
         
        </div>

    
      </div>
    </div>
  );
}
