// utils/storage/ashaStorage.ts
import { readJSON, writeJSON, upsertById } from './helpers';
import KEYS from './keys';
import type { ASHAWorker, ActiveSession } from '@/types';

export async function saveASHAWorker(worker: ASHAWorker): Promise<void> {
  const existing = await getASHAWorkers();
  await writeJSON(KEYS.ASHA_WORKERS, upsertById(existing, worker));
}

export async function getASHAWorkers(): Promise<ASHAWorker[]> {
  return readJSON<ASHAWorker[]>(KEYS.ASHA_WORKERS, []);
}

export async function deleteASHAWorker(id: string): Promise<void> {
  const workers = await getASHAWorkers();
  await writeJSON(KEYS.ASHA_WORKERS, workers.filter((w) => w.id !== id));
}

export async function setActiveSession(session: ActiveSession): Promise<void> {
  await writeJSON(KEYS.ACTIVE_SESSION, session);
}

export async function getActiveSession(): Promise<ActiveSession | null> {
  return readJSON<ActiveSession | null>(KEYS.ACTIVE_SESSION, null);
}

export async function clearActiveSession(): Promise<void> {
  await writeJSON(KEYS.ACTIVE_SESSION, null);
}