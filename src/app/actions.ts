'use server'
import { TClimateData , TAirQualityData, TFireEventData } from "../types";
import { AirQuality } from "../api/AirQuality"
import { FireEvents } from "../api/FireEvents";
import { DroughtData } from "../api/DroughtData";
import { fetchYearTempRaise } from "../api/TempData";
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
    
    return DroughtData(stateName);
}

export async function fetchTempData(stateName :string) : Promise<number>{
return await fetchYearTempRaise(stateName);
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
  animals : string[],
  temperatureDelta : number
}) {
  const FormatedData = {
    state: data.state,
    droughtDescription: data.droughtLevel !== null ? describeDrought(data.droughtLevel) : "No data",
    aqi: data.aqi,
    fires: data.fires,
    animals : data.animals,
    temperatureDelta : data.temperatureDelta

  };


  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"), // fast + cheap
    prompt: `You are a helpful climate dashboard assistant. You are given a U.S. state and a specific location within that state, along with recent environmental data including:

- Average drought severity for the state (0–5)
- Air Quality Index (AQI) at the selected location (note that 0 means data is unavailable)
- Number of active wildfires in the state
- Average temperature difference compared to the same period last year (in °C)

Your task is to generate a JSON object with three sections:

1. "summary": A concise, clear paragraph describing current environmental conditions for the state and the selected location, written for a general audience. Include how current temperatures compare to last year — note whether the area is warmer or cooler than usual and by how much. If AQI is 0, say that air quality data is not available at this location.

2. "recommendations": A list of 2–4 actionable recommendations written for someone living specifically at the selected location, not the state generally. Prioritize the most urgent condition first (e.g. if wildfires are active nearby, lead with that). Make advice concrete and specific — instead of "check air quality," say "if AQI rises above 100, wear an N95 mask outdoors and keep windows closed." Use the actual AQI number, fire count, and drought level in the advice where natural. Write like you're texting a friend who lives there, not filing a report.

3. "endangeredSpeciesImpact": A list of 1–3 endangered species that occur in the state, and a brief description of how current drought, air quality (if available), wildfire conditions, and temperature deviation from last year might affect them. Explain how unusual warmth or cold specifically stresses each species — for example, effects on breeding cycles, habitat range, food availability, or migration. Do not include species that are unlikely to occur in the state.

Make the output strictly JSON with these keys only. Example:

{
  "summary": "California is experiencing moderate drought conditions with temperatures running about 4°F warmer than this time last year, AQI is moderate at the selected location, and a small number of active fires are present. The warmer-than-normal conditions are compounding stress on local ecosystems.",
  "recommendations": [
    "With 77 active wildfires in the state, check your local evacuation zone now at ready.ca.gov — don't wait for an alert.",
    "Your AQI is currently 46 (Good), but if it climbs above 100, close your windows and wear an N95 outdoors.",
    "Avoid burning debris or using fire-prone equipment outdoors during dry periods.",
    "Limit strenuous outdoor activity during the hottest parts of the day, as temperatures are running above last year."
  ],
  "endangeredSpeciesImpact": [
    {
      "species": "California condor",
      "impact": "Dry conditions reduce water availability and food sources. Temperatures running warmer than last year are shifting thermal columns condors rely on for soaring, and may push carcass decomposition rates in ways that affect foraging patterns."
    }
  ]
}

Here is the data for the state and location you need to summarize:
Data: ${JSON.stringify(FormatedData, null, 2)}

Use the provided state, location name, drought, AQI, fire, and temperature difference data to fill this template. If AQI or drought data is 0, treat it as unavailable and note that in your summary. Write recommendations for people, not agencies or scientists. Be specific — use the real numbers from the data, reference the actual location by name, and prioritize the most pressing risk.`,
  });
  console.log(text)
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