'use server'
import process from "process";
import { parse } from "csv-parse/sync";
let cachedFires: any[] | null = null;
export async function FireEvents() : Promise<any> {
    if(cachedFires) return cachedFires
const key = process.env.NASAFIRMS_API_KEY
const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/VIIRS_NOAA20_NRT/-125,24,-66,50/1/2026-04-04`
const res = await fetch(url);
 const csv = await res.text();
  cachedFires = parse(csv, { columns: true, skip_empty_lines: true });
  console.log(cachedFires);
  return cachedFires

}