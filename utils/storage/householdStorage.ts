// utils/storage/householdStorage.ts
import { readJSON, writeJSON, upsertById } from './helpers';
import KEYS from './keys';
import type { Household } from '@/types';

export async function saveHousehold(household: Household): Promise<void> {
  const existing = await getHouseholds();
  await writeJSON(KEYS.HOUSEHOLDS, upsertById(existing, household));
}

export async function getHouseholds(): Promise<Household[]> {
  return readJSON<Household[]>(KEYS.HOUSEHOLDS, []);
}

export async function getHouseholdById(id: string): Promise<Household | null> {
  const households = await getHouseholds();
  return households.find((h) => h.id === id) ?? null;
}

export async function getHouseholdsForVillage(villageId: string): Promise<Household[]> {
  const all = await getHouseholds();
  return all.filter((h) => h.villageId === villageId);
}

export async function deleteHousehold(householdId: string): Promise<void> {
  const { getPersons, deletePerson } = await import('./personStorage');
  const persons = await getPersons();
  const affected = persons.filter((p) => p.householdId === householdId);
  await Promise.all(affected.map((p) => deletePerson(p.id)));
  const households = await getHouseholds();
  await writeJSON(KEYS.HOUSEHOLDS, households.filter((h) => h.id !== householdId));
}