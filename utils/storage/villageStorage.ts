// utils/storage/villageStorage.ts
import { readJSON, writeJSON, upsertById } from './helpers';
import KEYS from './keys';
import type { Village } from '@/types';

export async function saveVillage(village: Village): Promise<void> {
  const existing = await getVillages();
  await writeJSON(KEYS.VILLAGES, upsertById(existing, village));
}

export async function getVillages(): Promise<Village[]> {
  return readJSON<Village[]>(KEYS.VILLAGES, []);
}

export async function getVillageById(id: string): Promise<Village | null> {
  const villages = await getVillages();
  return villages.find((v) => v.id === id) ?? null;
}

export async function deleteVillage(villageId: string): Promise<void> {
  const { getHouseholds, deleteHousehold } = await import('./householdStorage');
  const households = await getHouseholds();
  const affected = households.filter((h) => h.villageId === villageId);
  await Promise.all(affected.map((h) => deleteHousehold(h.id)));
  const villages = await getVillages();
  await writeJSON(KEYS.VILLAGES, villages.filter((v) => v.id !== villageId));
}