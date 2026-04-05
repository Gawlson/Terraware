'use server'

const stateToFIPS: Record<string, string> = {
  "alabama": "01",
  "alaska": "02",
  "arizona": "04",
  "arkansas": "05",
  "california": "06",
  "colorado": "08",
  "connecticut": "09",
  "delaware": "10",
  "district of columbia": "11",
  "florida": "12",
  "georgia": "13",
  "hawaii": "15",
  "idaho": "16",
  "illinois": "17",
  "indiana": "18",
  "iowa": "19",
  "kansas": "20",
  "kentucky": "21",
  "louisiana": "22",
  "maine": "23",
  "maryland": "24",
  "massachusetts": "25",
  "michigan": "26",
  "minnesota": "27",
  "mississippi": "28",
  "missouri": "29",
  "montana": "30",
  "nebraska": "31",
  "nevada": "32",
  "new hampshire": "33",
  "new jersey": "34",
  "new mexico": "35",
  "new york": "36",
  "north carolina": "37",
  "north dakota": "38",
  "ohio": "39",
  "oklahoma": "40",
  "oregon": "41",
  "pennsylvania": "42",
  "puerto rico": "72",
  "rhode island": "44",
  "south carolina": "45",
  "south dakota": "46",
  "tennessee": "47",
  "texas": "48",
  "utah": "49",
  "vermont": "50",
  "virginia": "51",
  "washington": "53",
  "west virginia": "54",
  "wisconsin": "55",
  "wyoming": "56"
};
let cachedDroughtData: Map<
  string,
  { avgDroughtLevel: number; severity: { label: string; color: string } }
> = new Map();
// Usage
// const caData = cachedDroughtData.get("California");
// if (caData) {
//   console.log(caData.avgDroughtLevel); // 0.15
//   console.log(caData.severity.label);  // "Mild"
//   console.log(caData.severity.color);  // "#A7C957"
// }
function getFIPS(stateName: string): string | undefined {
  return stateToFIPS[stateName.toLowerCase()];
}







export async function DroughtData(stateName : string) {
    const stateFIPS = getFIPS(stateName)
    const cachedata = cachedDroughtData.get(stateName);
    if(cachedata){
      console.log('droiught cache hit')
      return cachedata
    }
const url = `https://usdmdataservices.unl.edu/api/StateStatistics/GetDroughtSeverityStatisticsByArea?aoi=${stateFIPS}&startdate=1/1/2026&enddate=4/1/2026&statisticsType=1`;
    const response = await fetch(url, {
        headers: {
            "Accept": "application/json"
        },
    }
    );
     if (!response.ok) {
    throw new Error(`Failed to fetch drought data: ${response.status}`);
  }

  const data = await response.json();
  console.log(stateName)
  //console.log("water")
//console.log(data)
  const avgDroughtLevel = computeMonthlyAverage(data)
  const severity = await droughtLabel(avgDroughtLevel)
  console.log(avgDroughtLevel)
  cachedDroughtData.set(stateName,
   { avgDroughtLevel, severity}
  )
  return { avgDroughtLevel, severity }

}

function computeMonthlyAverage(data: any[]) {
  if (!data || data.length === 0) return 0;

  let totalWeighted = 0;
  let totalArea = 0;

  data.forEach(week => {
    const weekTotal = week.none + week.d0 + week.d1 + week.d2 + week.d3 + week.d4;
    const weekWeighted =
      week.d0 * 1 +
      week.d1 * 2 +
      week.d2 * 3 +
      week.d3 * 4 +
      week.d4 * 5;

    totalWeighted += weekWeighted;
    totalArea += weekTotal;
  });

  const avgSeverity = totalWeighted / totalArea;
  console.log(avgSeverity)
  return avgSeverity;
}
  

export async function droughtLabel(avgSeverity: number) {
  
  if (avgSeverity <= 1.0) return { label: "Good", color: "#6A994E" };
  if (avgSeverity <= 2.0) return { label: "Moderate", color: "#A7C957" };
  if (avgSeverity <= 3.0) return { label: "Unhealthy", color: "#f59e0b" };
  return { label: "Hazardous", color: "#BC4749" };
}