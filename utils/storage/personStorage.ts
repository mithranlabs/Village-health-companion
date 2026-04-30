// utils/storage/personStorage.ts
import { readJSON, writeJSON, upsertById } from './helpers';
import KEYS from './keys';
import type { Person } from '@/types';

export async function savePerson(person: Person): Promise<void> {
  const existing = await getPersons();
  await writeJSON(KEYS.PERSONS, upsertById(existing, person));
}

export async function getPersons(): Promise<Person[]> {
  return readJSON<Person[]>(KEYS.PERSONS, []);
}

export async function getPersonById(id: string): Promise<Person | null> {
  const persons = await getPersons();
  return persons.find((p) => p.id === id) ?? null;
}

export async function getPersonsForHousehold(householdId: string): Promise<Person[]> {
  const all = await getPersons();
  return all.filter((p) => p.householdId === householdId);
}

export async function deletePerson(personId: string): Promise<void> {
  const { getVisits } = await import('./visitStorage');
  const { writeJSON: wj } = await import('./helpers');
  const visits = await getVisits();
  await wj(KEYS.VISITS, visits.filter((v) => v.personId !== personId));
  const persons = await getPersons();
  await writeJSON(KEYS.PERSONS, persons.filter((p) => p.id !== personId));
}