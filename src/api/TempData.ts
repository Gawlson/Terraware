import process from "process"

 const STATE_CENTROIDS: Record<string, { lat: number; long: number }> = {
  "Alabama": { lat: 32.8067, long: -86.7911 },
  "Alaska": { lat: 64.2008, long: -153.4937 },
  "Arizona": { lat: 34.0489, long: -111.0937 },
  "Arkansas": { lat: 34.7999, long: -92.3731 },
  "California": { lat: 36.7783, long: -119.4179 },
  "Colorado": { lat: 39.5501, long: -105.7821 },
  "Connecticut": { lat: 41.6032, long: -73.0877 },
  "Delaware": { lat: 38.9108, long: -75.5277 },
  "Florida": { lat: 27.9944, long: -81.7603 },
  "Georgia": { lat: 32.1656, long: -82.9001 },
  "Hawaii": { lat: 19.8968, long: -155.5828 },
  "Idaho": { lat: 44.0682, long: -114.7420 },
  "Illinois": { lat: 40.6331, long: -89.3985 },
  "Indiana": { lat: 40.2672, long: -86.1349 },
  "Iowa": { lat: 41.8780, long: -93.0977 },
  "Kansas": { lat: 39.0119, long: -98.4842 },
  "Kentucky": { lat: 37.8393, long: -84.2700 },
  "Louisiana": { lat: 31.2448, long: -92.1450 },
  "Maine": { lat: 45.2538, long: -69.4455 },
  "Maryland": { lat: 39.0458, long: -76.6413 },
  "Massachusetts": { lat: 42.4072, long: -71.3824 },
  "Michigan": { lat: 44.3148, long: -85.6024 },
  "Minnesota": { lat: 46.7296, long: -94.6859 },
  "Mississippi": { lat: 32.3547, long: -89.3985 },
  "Missouri": { lat: 37.9643, long: -91.8318 },
  "Montana": { lat: 46.8797, long: -110.3626 },
  "Nebraska": { lat: 41.4925, long: -99.9018 },
  "Nevada": { lat: 38.8026, long: -116.4194 },
  "New Hampshire": { lat: 43.1939, long: -71.5724 },
  "New Jersey": { lat: 40.0583, long: -74.4057 },
  "New Mexico": { lat: 34.5199, long: -105.8701 },
  "New York": { lat: 42.1657, long: -74.9481 },
  "North Carolina": { lat: 35.6301, long: -79.8064 },
  "North Dakota": { lat: 47.5515, long: -101.0020 },
  "Ohio": { lat: 40.4173, long: -82.9071 },
  "Oklahoma": { lat: 35.4676, long: -97.5164 },
  "Oregon": { lat: 44.5720, long: -122.0709 },
  "Pennsylvania": { lat: 41.2033, long: -77.1945 },
  "Rhode Island": { lat: 41.6809, long: -71.5118 },
  "South Carolina": { lat: 33.8361, long: -81.1637 },
  "South Dakota": { lat: 43.9695, long: -99.9018 },
  "Tennessee": { lat: 35.5175, long: -86.5804 },
  "Texas": { lat: 31.9686, long: -99.9018 },
  "Utah": { lat: 39.3210, long: -111.0937 },
  "Vermont": { lat: 44.5588, long: -72.5778 },
  "Virginia": { lat: 37.4316, long: -78.6569 },
  "Washington": { lat: 47.7511, long: -120.7401 },
  "West Virginia": { lat: 38.5976, long: -80.4549 },
  "Wisconsin": { lat: 43.7844, long: -88.7879 },
  "Wyoming": { lat: 43.0760, long: -107.2903 }
}

const temperatureCache : Record<string, number> = {};


// export async function  fetchYearTempRaise(stateName : string){

//     if(temperatureCache[stateName]){
//         console.log('temp cache hit');
//         return temperatureCache[stateName]
//     }


//     const { lat, long } = STATE_CENTROIDS[stateName]
//     const KEY = process.env.VISUALCROSSING_API_KEY

// const url_thisyear = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${long}/2026-03-01/2026-04-01?unitGroup=metric&include=days&key=${KEY}`


// const url_lastyear = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${long}/2025-03-01/2025-04-01?unitGroup=metric&include=days&key=${KEY}`
// await new Promise(resolve => setTimeout(resolve, 500));
// const data_pm = await fetch(url_thisyear)

// // Adding a slight delay to avoid rate-limiting
// await new Promise(resolve => setTimeout(resolve, 500));

// const data_ly = await fetch(url_lastyear)
// if(!data_pm.ok || !data_ly.ok)
// {    throw new Error(`Failed to fetch drought data: ${data_pm.status} and ${data_ly.status}`);

// }

// const data_pmjson = await data_pm.json()
// const data_lyjson = await data_ly.json()

// const avgTemp = (days: any[]) => 
//   days.reduce((sum, d) => sum + d.temp, 0) / days.length

// const thisYearAvg = avgTemp(data_pmjson.days)
// const lastYearAvg = avgTemp(data_lyjson.days)
// const delta = thisYearAvg - lastYearAvg
// const returndelta = `Delta: ${delta.toFixed(2)}°C`

// console.log(`Delta: ${delta.toFixed(2)}°C`)
// console.log("TEMP HEAT!!!")
// temperatureCache[stateName] = delta;
// return delta;

// }


export async function fetchYearTempRaise(stateName: string) {
    const { lat, long } = STATE_CENTROIDS[stateName]
    
    const url = (start: string, end: string) =>
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${long}&start_date=${start}&end_date=${end}&daily=temperature_2m_mean`

    const [r1, r2] = await Promise.all([
        fetch(url("2026-03-01", "2026-04-01")),
        fetch(url("2025-03-01", "2025-04-01"))
    ])

    if (!r1.ok || !r2.ok) {
        throw new Error(`Failed to fetch temp data: ${r1.status} and ${r2.status}`)
    }

    const [d1, d2] = await Promise.all([r1.json(), r2.json()])

    const avg = (temps: number[]) => {
        const valid = temps.filter(t => t !== null && t !== undefined)
        return valid.reduce((a, b) => a + b, 0) / valid.length
    }

    return avg(d1.daily.temperature_2m_mean) - avg(d2.daily.temperature_2m_mean)
}