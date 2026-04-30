// utils/storage/visitStorage.ts
import { readJSON, writeJSON, upsertById } from './helpers';
import KEYS from './keys';
import type { Visit } from '@/types';

export async function saveVisit(visit: Visit): Promise<void> {
  const existing = await getVisits();
  await writeJSON(KEYS.VISITS, upsertById(existing, visit));
}

export async function getVisits(): Promise<Visit[]> {
  return readJSON<Visit[]>(KEYS.VISITS, []);
}

export async function getVisitsForPerson(personId: string): Promise<Visit[]> {
  const all = await getVisits();
  return all
    .filter((v) => v.personId === personId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getUnsyncedVisits(): Promise<Visit[]> {
  const all = await getVisits();
  return all.filter((v) => !v.isSynced);
}

export async function markVisitSynced(visitId: string): Promise<void> {
  const visits = await getVisits();
  await writeJSON(
    KEYS.VISITS,
    visits.map((v) => (v.id === visitId ? { ...v, isSynced: true } : v)),
  );
}