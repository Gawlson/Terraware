import 'server-only'
import process from "process";
export  async function AirQuality (lat: number, long : number){
   const key = process.env.AIRNOW_API_KEY;
const url = `https://www.airnowapi.org/aq/forecast/latLong/?format=application/json&latitude=40.015&longitude=-105.270556&api_key=${key}`
const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`AirNow API error: ${response.status}`);

  }
  const data = await response.json();
  console.log(data[0].Category.Name)
  return data[0].Category.Name

}