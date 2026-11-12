import { useQuery } from '@tanstack/react-query';
import { client } from '../api/client';
import type { ApiEnvelope } from '../types';

export type StaffProfile = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  companyId: number;
  locationId: number | null;
  createdAt: string;
  updatedAt: string;
  shiftStart: string | null;
  shiftEnd: string | null;
};

export type ProfileHttp = {
  get: (url: string, config?: { signal?: AbortSignal }) => Promise<{ data: unknown }>;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const nullableString = (value: unknown): string | null | undefined =>
  value === null || value === undefined ? null : typeof value === 'string' ? value : undefined;

const nullableNumber = (value: unknown): number | null | undefined =>
  value === null || value === undefined ? null : typeof value === 'number' ? value : undefined;

export function parseStaffProfile(value: unknown): StaffProfile | null {
  if (!isObject(value)) return null;
  const { id, name, email, role, isActive, companyId, createdAt, updatedAt } = value;
  const phone = nullableString(value.phone);
  const locationId = nullableNumber(value.locationId);
  const shiftStart = nullableString(value.shiftStart);
  const shiftEnd = nullableString(value.shiftEnd);
  if (typeof id !== 'number' || typeof name !== 'string' || typeof email !== 'string') return null;
  if (typeof role !== 'string' || typeof isActive !== 'boolean' || typeof companyId !== 'number') return null;
  if (typeof createdAt !== 'string' || typeof updatedAt !== 'string') return null;
  if (phone === undefined || locationId === undefined || shiftStart === undefined || shiftEnd === undefined) return null;
  return { id, name, email, phone, role, isActive, companyId, locationId, createdAt, updatedAt, shiftStart, shiftEnd };
}

export async function fetchStaffProfile(http: ProfileHttp, signal?: AbortSignal): Promise<StaffProfile | null> {
  const response = await http.get('/staff/profile/me', { signal });
  const envelope = response.data as ApiEnvelope<unknown>;
  return parseStaffProfile(envelope?.data);
}

export const profileQueryKey = (staffId: number | undefined) => ['staff', staffId, 'profile'] as const;

export const useStaffProfileQuery = (staffId: number | undefined, enabled = true) => useQuery({
  queryKey: profileQueryKey(staffId),
  queryFn: ({ signal }) => fetchStaffProfile(client, signal),
  enabled: Boolean(staffId) && enabled,
  staleTime: 5 * 60 * 1000,
});
