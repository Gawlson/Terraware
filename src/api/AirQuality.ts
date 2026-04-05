import 'server-only'
import process from "process";
export  async function AirQuality (lat: number, long : number){
   const key = process.env.AIRNOW_API_KEY;
   ///aq/observation/latLong/current
const url = `https://www.airnowapi.org/aq/observation/latLong/current?format=application/json&latitude=${lat}&longitude=${long}&distance=150&api_key=${key}`
const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`AirNow API error: ${response.status}`);

  }
  const data = await response.json();
  
  return data[0]

}
//convert to server action