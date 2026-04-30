// types/index.ts

export type Gender = 'Male' | 'Female' | 'Other';

export interface ASHAWorker {
  id: string;
  name: string;
  phone: string;
  villageIds: string[];
}

export interface ActiveSession {
  ashaId: string;
  ashaName: string;
}

export interface Village {
  id: string;
  name: string;
  block: string;
  district: string;
  state: string;
}

export interface Household {
  id: string;
  villageId: string;
  address: string;
  headName: string;
  totalMembers: number;
}

export interface Person {
  id: string;
  householdId: string;
  name: string;
  age: number;
  gender: Gender;
  phone?: string;
}

export interface Visit {
  id: string;
  personId: string;
  ashaId: string;
  date: string;
  bloodPressure: number;
  weight: number;
  notes?: string;
  isSynced: boolean;
  hasAlert: boolean;
}