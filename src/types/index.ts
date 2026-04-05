export type EventType = "wildfire" | "heat" | "drought" | "flood" | "oilspill" | "species";

export interface ClimateEvent {
  id: number;
  lat: number;
  lng: number;
  type: EventType;
  name: string;
  location: string;
  color: string;
  size: number;
  desc: string;
  stats: [string, string][];
}
export interface TClimateData {
  aqi?: number;
  category?: string;
  pollutant?: string;
  airqualitydata? : TAirQualityData,
  fireeventdata? : TFireEventData[]
  // add more
}
export interface TAirQualityData {
   
    dateObserved:string,
     aqi:number,
     categoryNumber:number,
    categoryName: string
  
  
}
export interface TFireEventData {
  latitude: string;
  longitude: string;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: string;
  daynight: string;
}
