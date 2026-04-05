'use server'
import { TClimateData , TAirQualityData, TFireEventData } from "../types";
import { AirQuality } from "../api/AirQuality"
import { FireEvents } from "../api/FireEvents";
export async function fetchClimateData(Latitude:number, Longitude: number) : Promise<TClimateData> {
const AirQualityData = await AirQuality(Latitude, Longitude);
const AirQualityData_parsed = await parseAirQualityData(AirQualityData);
const FireData = await fetchFireData();
return { airqualitydata: AirQualityData_parsed, fireeventdata : FireData }
/*add more later */
}
 async function parseAirQualityData(AirQualityData : any) : Promise<TAirQualityData> {
    console.log(AirQualityData)
  if (!AirQualityData) {
    console.log("fuck")
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