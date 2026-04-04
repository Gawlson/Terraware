import { EventType } from "../types";
import { EVENT_LABELS, EVENT_COLORS } from "../data/events";

interface ToolbarProps {
  activeFilter: EventType | "all";
  onFilterChange: (filter: EventType | "all") => void;
  isSpinning: boolean;
  onToggleSpin: () => void;
  onReset: () => void;
}

export default function Toolbar({ activeFilter, onFilterChange, isSpinning, onToggleSpin, onReset }: ToolbarProps) {
  const filters: (EventType | "all")[] = ["all", ...Object.keys(EVENT_LABELS) as EventType[]];

  return (
    <div style={{
      position: "absolute",
      top: 16,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "rgba(4,10,20,0.85)",
      border: "0.5px solid rgba(255,255,255,0.08)",
      borderRadius: 8,
      padding: "6px 10px",
      zIndex: 10,
      fontFamily: "monospace",
    }}>
      {filters.map(f => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          style={{
            padding: "4px 10px",
            fontSize: 9,
            fontFamily: "monospace",
            letterSpacing: "0.1em",
            cursor: "pointer",
            border: "0.5px solid",
            borderRadius: 4,
            background: activeFilter === f ? "rgba(255,255,255,0.08)" : "transparent",
            borderColor: activeFilter === f ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)",
            color: activeFilter === f
              ? f === "all" ? "#e8e8e0" : EVENT_COLORS[f]
              : "rgba(255,255,255,0.3)",
            transition: "all 0.15s",
          }}
        >
          {f === "all" ? "ALL" : EVENT_LABELS[f].toUpperCase()}
        </button>
      ))}

      <div style={{ width: "0.5px", height: 16, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

      <button
        onClick={onToggleSpin}
        style={{
          padding: "4px 10px", fontSize: 9, fontFamily: "monospace",
          letterSpacing: "0.1em", cursor: "pointer", border: "0.5px solid", borderRadius: 4,
          background: isSpinning ? "rgba(29,158,117,0.1)" : "transparent",
          borderColor: isSpinning ? "rgba(29,158,117,0.4)" : "rgba(255,255,255,0.07)",
          color: isSpinning ? "#1D9E75" : "rgba(255,255,255,0.3)",
        }}
      >
        ⟳ SPIN
      </button>

      <button
        onClick={onReset}
        style={{
          padding: "4px 10px", fontSize: 9, fontFamily: "monospace",
          letterSpacing: "0.1em", cursor: "pointer",
          border: "0.5px solid rgba(255,255,255,0.07)",
          borderRadius: 4, background: "transparent", color: "rgba(255,255,255,0.3)",
        }}
      >
        ⌖ RESET
      </button>
    </div>
  );
}
