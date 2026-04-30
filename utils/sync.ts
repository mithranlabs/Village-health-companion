import { createClient } from '@supabase/supabase-js';
import { getHouseholds, getPersons, getUnsyncedVisits, getVillages, markVisitSynced } from './storage';

const supabase = createClient(
  'https://siekmhkmkbsdgtlrpwbc.supabase.co',   // get this from him
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZWttaGtta2JzZGd0bHJwd2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjU5MTIsImV4cCI6MjA5MzA0MTkxMn0.ef0BibCmiGrBHdhRaJBPJ7B1kOVN1bghNP7w6mEHy1c'
);

export async function syncToSupabase(): Promise<{ success: boolean; synced: number; error?: string }> {
  try {
    const [persons, villages, households, unsyncedVisits] = await Promise.all([
      getPersons(),
      getVillages(),
      getHouseholds(),
      getUnsyncedVisits(),
    ]);

    if (unsyncedVisits.length === 0) return { success: true, synced: 0 };

    // Build lookup maps
    const householdMap = Object.fromEntries(households.map(h => [h.id, h]));
    const villageMap = Object.fromEntries(villages.map(v => [v.id, v]));

    // Only upsert persons that have unsynced visits
    const personIds = [...new Set(unsyncedVisits.map(v => v.personId))];
    const relevantPersons = persons.filter(p => personIds.includes(p.id));

    // Upsert persons — reuse local UUID as remote UUID (clean & no duplicates)
    const personRows = relevantPersons.map(p => {
      const household = householdMap[p.householdId];
      const village = household ? villageMap[household.villageId] : null;
      return {
        id: p.id,                    // reuse local UUID
        name: p.name,
        age: p.age ?? null,
        gender: p.gender ?? null,
        village: village?.name ?? null,
        phone: p.phone ?? null,
        category: 'general',
      };
    });

    const { error: personError } = await supabase
      .from('persons')
      .upsert(personRows, { onConflict: 'id' });

    if (personError) return { success: false, synced: 0, error: personError.message };

    // Upsert visits — blood_pressure triggers auto-alert on friend's dashboard!
    const visitRows = unsyncedVisits.map(v => ({
      id: v.id,
      person_id: v.personId,
      blood_pressure: v.bloodPressure ?? null,   // ⚠️ change 'v.bp' to whatever your Visit type calls it
      weight: v.weight ?? null,
      visited_at: v.date,
    }));

    const { error: visitError } = await supabase
      .from('visits')
      .upsert(visitRows, { onConflict: 'id' });

    if (visitError) return { success: false, synced: 0, error: visitError.message };

    // Mark all synced locally
    await Promise.all(unsyncedVisits.map(v => markVisitSynced(v.id)));

    return { success: true, synced: unsyncedVisits.length };
  } catch (e: any) {
    return { success: false, synced: 0, error: e.message };
  }
}