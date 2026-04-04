'use client'
import { useState, useRef, useMemo } from "react";
import Globe from "../components/Globe";
import SidePanel from "../components/SidePanel";
import Toolbar from "../components/Toolbar";
import { CLIMATE_EVENTS } from "../data/events";
import { ClimateEvent, EventType } from "../types";

export default function App() {
  const [selectedEvent, setSelectedEvent] = useState<ClimateEvent | null>(null);
  const [activeFilter, setActiveFilter] = useState<EventType | "all">("all");
  const [isSpinning, setIsSpinning] = useState(true);
  const flyToRef = useRef<((lat: number, lng: number) => void) | null>(null);

  const filteredEvents = useMemo(() =>
    activeFilter === "all"
      ? CLIMATE_EVENTS
      : CLIMATE_EVENTS.filter(e => e.type === activeFilter),
    [activeFilter]
  );

  const handleEventClick = (event: ClimateEvent) => {
    setSelectedEvent(event);
    flyToRef.current?.(event.lat, event.lng);
  };

  const handleReset = () => {
    setSelectedEvent(null);
    flyToRef.current?.(39.5, -98.35);
  };

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
          <Globe
            events={filteredEvents}
            onEventClick={handleEventClick}
            flyToRef={flyToRef}
            isSpinning={isSpinning}
          />
          <Toolbar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            isSpinning={isSpinning}
            onToggleSpin={() => setIsSpinning(p => !p)}
            onReset={handleReset}
          />
          <div style={{
            position: "absolute", bottom: 16, left: 16,
            fontSize: 9, fontFamily: "monospace",
            color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", lineHeight: 1.8,
          }}>
            DRAG TO ROTATE · SCROLL TO ZOOM<br />
            CLICK MARKER TO INSPECT
          </div>
        </div>

        <SidePanel
          events={filteredEvents}
          selectedEvent={selectedEvent}
          onSelectEvent={handleEventClick}
          onClearSelection={() => setSelectedEvent(null)}
        />
      </div>
    </div>
  );
}
