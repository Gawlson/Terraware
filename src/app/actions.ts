'use server'
import { TClimateData , TAirQualityData, TFireEventData } from "../types";
import { AirQuality } from "../api/AirQuality"
import { FireEvents } from "../api/FireEvents";
import { DroughtData } from "../api/DroughtData";
export async function fetchClimateData(Latitude: number, Longitude: number): Promise<TClimateData> {
  let AirQualityData_parsed: TAirQualityData = { 
    dateObserved: '', 
    aqi: 0, 
    categoryNumber: 0, 
    categoryName: 'Unknown' 
  };

  try {
    const AirQualityData = await AirQuality(Latitude, Longitude);
    AirQualityData_parsed = await parseAirQualityData(AirQualityData);
  } catch (e) {
    console.error("AirNow failed:", e);
  }

  const FireData = await fetchFireData();
  return { airqualitydata: AirQualityData_parsed, fireeventdata: FireData }
}

 async function parseAirQualityData(AirQualityData : any) : Promise<TAirQualityData> {
    console.log(AirQualityData)
  if (!AirQualityData) {
    return { dateObserved: '', aqi: 0, categoryNumber: 0, categoryName: 'Unknown' };
  }
  console.log("pass")
  const data = {
    dateObserved: AirQualityData.DateObserved?.trim() || '',
    aqi: AirQualityData.AQI || 0,
    categoryNumber: AirQualityData.Category?.Number || 0,
    categoryName: AirQualityData.Category?.Name || 'Unknown'
  };
  return data;
}
export async function fetchFireData() : Promise<TFireEventData[]> {

return await FireEvents()


}
export async function fetchDroughtData(stateName: string) : Promise<{   avgDroughtLevel: number;
    severity: {
        label: string;
        color: string;
    };}>{
    //  avgDroughtLevel: number;
    // severity: {
    //     label: string;
    //     color: string;
    // };
    return DroughtData(stateName);
}






import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
// let userMap: Map<string, number> = new Map();

// // Add entries
// userMap.set("Alice", 25);
// userMap.set("Bob", 30);

// // Retrieve a value
// console.log(userMap.get("Alice"));
let responseCache : Record <string,string> = {}

export async function generateActionPlan(data: {
  state: string;
  droughtLevel: number | null; //test if null
  aqi: number | null;
  fires : number;
  animals : string[]
}) {
  const FormatedData = {
    state: data.state,
    droughtDescription: data.droughtLevel !== null ? describeDrought(data.droughtLevel) : "No data",
    aqi: data.aqi,
    fires: data.fires,
    animals : data.animals

  };
if(responseCache[data.state]){
  console.log("cache hit")
  return responseCache[data.state]

}

  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"), // fast + cheap
    prompt: `You are a helpful climate dashboard assistant. You are given a U.S. state with recent environmental data including:

- Average drought severity (0–5)
- Air Quality Index (AQI)
- Number of active wildfires

Your task is to generate a JSON object with three sections:

1. "summary": A concise, clear paragraph describing current environmental conditions for the state, written for a general audience.
2. "recommendations": A list of 2–4 actionable recommendations for average people living in the state, written in plain language.
3. "endangeredSpeciesImpact": A list of 1–3 endangered species that occur in the state, and a brief description of how current drought, air quality, or fire conditions might affect them. Do not include species that are unlikely to occur in the state.

Make the output strictly JSON with these keys only. Example:

{
  "summary": "California is experiencing moderate drought conditions, AQI is moderate, and a small number of active fires are present.",
  "recommendations": [
    "Use water responsibly in your household and garden.",
    "Avoid burning debris or using fire-prone equipment outdoors during dry periods.",
    "Check local air quality reports before outdoor exercise."
  ],
  "endangeredSpeciesImpact": [
    {
      "species": "California condor",
      "impact": "Dry conditions reduce water availability and food sources, which may stress the population."
    }
  ]
}

Here is the data for the state you need to summarize:
${JSON.stringify(FormatedData, null, 2)}

Use the provided state, drought, AQI, and fire data to fill this template. Write recommendations for people, not agencies or scientists.
`,
  });
  responseCache[data.state] = text
  return text;
}




// airnow raw data ex[
//   {
//     "DateObserved": " 2026-04-04 ",
//     "HourObserved": 12,
//     "LocalTimeZone": "PST",
//     "ReportingArea": "Seattle",
//     "StateCode": "WA",
//     "Latitude": 47.6,
//     "Longitude": -122.3,
//     "ParameterName": "PM2.5",
//     "AQI": 42,
//     "Category": {
//       "Number": 1,
//       "Name": "Good"
//     }
//   }
// ]
function describeDrought(avgSeverity: number) {
  if (avgSeverity === 0) return "No drought";
  if (avgSeverity < 0.5) return "Minimal drought";
  if (avgSeverity < 1.5) return "Light drought";
  if (avgSeverity < 2.5) return "Moderate drought";
  if (avgSeverity < 3.5) return "Severe drought";
  return "Extreme drought";
}