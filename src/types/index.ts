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
