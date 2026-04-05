"use server"

import { SPECIES_LIST } from "../lib/species-data"
import speciesByState from "../lib/species-by-state.json"


async function fetchWithRetry(url: string): Promise<any> {
  const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
  if (!res.ok) return null
  return res.json()
}

const cache = new Map<string, any[]>()



export async function getEndangeredSpecies(stateProvince: string) {
  const names: string[] = (speciesByState as Record<string, string[]>)[stateProvince] || []
  return names
    .map(name => SPECIES_LIST.find(s => s.commonName === name))
    .filter(Boolean)
}