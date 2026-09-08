import type { ArasaacPictogram } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const functionUrl = `${SUPABASE_URL}/functions/v1/arasaac-proxy`;

const headers: Record<string, string> = {
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export async function searchPictograms(searchText: string, language = 'es'): Promise<ArasaacPictogram[]> {
  const trimmed = searchText.trim();
  if (!trimmed) return [];

  const url = `${functionUrl}/pictograms/${language}/search/${encodeURIComponent(trimmed)}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Error al buscar pictogramas: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data as ArasaacPictogram[];
}

export async function getPictogramImageUrl(id: number, thumbnail = false): Promise<string> {
  return `${functionUrl}/pictograms/${id}${thumbnail ? '?thumbnail=true' : ''}`;
}
