// utils/storage/helpers.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const index = list.findIndex((i) => i.id === item.id);
  return index !== -1
    ? list.map((i) => (i.id === item.id ? item : i))
    : [...list, item];
}