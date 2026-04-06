import React from "react";
import { useState, useEffect } from "react";
import { useTransition } from "react";
import { generateActionPlan } from "../app/actions";
import { json } from "stream/consumers";
interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stateName?: string;
  stateClimateData: {
    state: string,
    droughtLevel: number | null,
    aqi: number,
    fires: number,
    animals : string[],
    temperatureDelta : number
  } | null
}

export default function ActionModal({ isOpen, onClose, stateName = "this region", stateClimateData }: ActionModalProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    summary: string;
    recommendations: string[];
    endangeredSpeciesImpact: { species: string; impact: string }[];
  } | null>(null);

  useEffect(() => {
    if (isOpen && stateClimateData) {
      setResult(null); // clear previous result
      startTransition(() => {
        generateActionPlan(stateClimateData)
          .then(res => {
            try {
              // Strip out any markdown code blocks the AI might have accidentally added
              const jsonString = res.replace(/```json/g, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(jsonString);
              setResult(parsed);
            } catch (err) {
              console.error("Failed to parse AI response:", err);
            }
          })
          .catch(console.error);
      });
    }
  }, [isOpen, stateClimateData]);

  if (!isOpen || !stateClimateData) return null;
  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10">
      {/* Backdrop (clicking it closes the modal) */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Content Box */}
      <div
        className="relative w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: "#F2E8CF", border: "1px solid #A7C957" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b" style={{ borderColor: "#A7C957" }}>
          <div className="flex items-center justify-between w-full" style={{ paddingLeft: "4px", paddingRight: "4px" }}>
            <div style={{ paddingTop: "2px" }}>
              <h2 className="text-2xl font-bold" style={{ color: "#386641" }}>✨ AI Action Plan</h2>
              <p className="text-sm font-mono mt-1" style={{ color: "#6A994E" }}>Insights & opportunities for {stateName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
              style={{ color: "#386641" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body (Scrollable area) */}
        <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6" style={{ color: "#386641" }}>

          {/* AI Summary Section */}
          <section>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span>📊</span> Climate Summary
            </h3>
            <div style={{ paddingLeft: "4px", paddingRight: "4px" }}>
              <div className="bg-white/60 rounded-xl text-sm leading-relaxed border-l-4" style={{ color: "#386641", borderColor: "#386641", padding: "1.25rem 1.5rem" }}>
                {isPending ? (
                  <p className="animate-pulse">Analyzing climate conditions...</p>
                ) : result ? (
                  <p>
                    {result.summary}
                  </p>
                ) : (
                  <p>No summary generated.</p>
                )}
              </div>
            </div>
          </section>

          {/* Individual DIY Actions */}
          <section>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span>🏡</span> What You Can Do
            </h3>
            <div className="flex flex-col gap-3" style={{ paddingLeft: "4px", paddingRight: "4px" }}>
              {isPending ? (
                <div className="bg-white/60 rounded-xl text-sm flex gap-3 items-start border-l-4" style={{ borderColor: "#6A994E", padding: "1.25rem" }}>
                   <p className="animate-pulse">Generating action plan...</p>
                </div>
              ) : result && result.recommendations ? (
                <div className="bg-white/60 rounded-xl text-sm flex gap-3 items-start border-l-4" style={{ borderColor: "#6A994E", padding: "1.25rem 1.5rem" }}>
                  <div className="flex-1 pr-2">
                    <ul className="list-disc pl-5 space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="pl-2">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p>No recommendations available.</p>
              )}
            </div>
          </section>

          {/* Endangered Species Impact */}
          <section>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span>🦅</span> Endangered Species Impact
            </h3>
            <div className="flex flex-col gap-3" style={{ paddingLeft: "4px", paddingRight: "4px" }}>
              {isPending ? (
                <div className="bg-white/60 rounded-xl text-sm border-l-4" style={{ borderColor: "#BC4749", padding: "1.25rem" }}>
                   <p className="animate-pulse">Loading species data...</p>
                </div>
              ) : result && result.endangeredSpeciesImpact ? (
                <div className="bg-white/60 rounded-xl text-sm flex gap-3 items-start border-l-4" style={{ borderColor: "#BC4749", padding: "1.25rem 1.5rem" }}>
                  <div className="flex-1 pr-2">
                    <ul className="list-disc pl-5 space-y-3">
                      {result.endangeredSpeciesImpact.map((item, index) => (
                        <li key={index} className="pl-2">
                          <p className="font-bold inline-block">{item.species}: </p>
                          <span className="opacity-80 ml-2">{item.impact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p>No species impact data available.</p>
              )}
            </div>
          </section>

          {/* Volunteer Events (Mockup) */}


        </div>
      </div>
    </div>
  );
}