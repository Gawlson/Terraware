import { ClimateEvent, EventType } from "../types";
import { EVENT_LABELS, EVENT_COLORS } from "../data/events";

interface StatRowProps {
  label: string;
  value: string;
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "7px 0",
      borderBottom: "0.5px solid rgba(255,255,255,0.06)",
    }}>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: "#e8e8e0", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

interface FeedItemProps {
  event: ClimateEvent;
  onClick: (event: ClimateEvent) => void;
}

function EventFeedItem({ event, onClick }: FeedItemProps) {
  return (
    <div
      onClick={() => onClick(event)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "9px 10px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: 6,
        border: "0.5px solid rgba(255,255,255,0.05)",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
    >
      <div style={{
        width: 7, height: 7, borderRadius: "50%",
        background: event.color, marginTop: 4, flexShrink: 0,
      }} />
      <div>
        <div style={{ fontSize: 12, color: "#e8e8e0", fontWeight: 500, marginBottom: 1 }}>
          {event.name}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          {event.location} · {EVENT_LABELS[event.type]}
        </div>
      </div>
    </div>
  );
}

interface SidePanelProps {
  events: ClimateEvent[];
  selectedEvent: ClimateEvent | null;
  onSelectEvent: (event: ClimateEvent) => void;
  onClearSelection: () => void;
}

export default function SidePanel({ events, selectedEvent, onSelectEvent, onClearSelection }: SidePanelProps) {
  return (
    <div style={{
      width: 270,
      background: "rgba(4,10,20,0.95)",
      borderLeft: "0.5px solid rgba(255,255,255,0.07)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ padding: "16px 18px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, fontFamily: "monospace", color: "#1D9E75", letterSpacing: "0.18em", marginBottom: 4 }}>
          ◎ CLIMATE MONITOR
        </div>
        <div style={{ fontSize: 14, fontFamily: "monospace", color: "#e8e8e0" }}>United States</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
          {events.length} active events
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {selectedEvent ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={onClearSelection}
              style={{
                background: "none", border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 5, color: "rgba(255,255,255,0.4)", fontSize: 10,
                fontFamily: "monospace", padding: "5px 10px", cursor: "pointer",
                letterSpacing: "0.08em", textAlign: "left",
              }}
            >
              ← ALL EVENTS
            </button>

            <div>
              <div style={{ fontSize: 14, fontFamily: "monospace", color: "#e8e8e0", marginBottom: 3 }}>
                {selectedEvent.name}
              </div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: selectedEvent.color, letterSpacing: "0.1em" }}>
                {selectedEvent.type.toUpperCase()} · {selectedEvent.location}
              </div>
            </div>

            <div style={{ height: "0.5px", background: "rgba(255,255,255,0.06)" }} />

            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
              {selectedEvent.desc}
            </p>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {selectedEvent.stats.map(([k, v]) => (
                <StatRow key={k} label={k} value={v} />
              ))}
            </div>

            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/search?q=${encodeURIComponent(selectedEvent.name + " " + selectedEvent.location + " climate")}`,
                  "_blank"
                )
              }
              style={{
                padding: "9px 12px", fontFamily: "monospace", fontSize: 10,
                cursor: "pointer", border: "0.5px solid rgba(29,158,117,0.4)",
                borderRadius: 6, background: "rgba(29,158,117,0.08)",
                color: "#1D9E75", width: "100%", letterSpacing: "0.08em",
              }}
            >
              LEARN MORE ↗
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", letterSpacing: "0.12em" }}>
              // CLICK A MARKER OR EVENT BELOW
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 2 }}>
                EVENT TYPES
              </div>
              {(Object.entries(EVENT_LABELS) as [EventType, string][]).map(([type, label]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: EVENT_COLORS[type] }} />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{ height: "0.5px", background: "rgba(255,255,255,0.06)" }} />

            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", letterSpacing: "0.1em" }}>
              ACTIVE EVENTS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {events.map(ev => (
                <EventFeedItem key={ev.id} event={ev} onClick={onSelectEvent} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
