import type { ArasaacPictogram } from './types';

const ARASAAC_API = 'https://api.arasaac.org/api';

interface ArasaacRawPictogram {
  _id: number;
  text?: string;
  keywords?: Array<{ keyword: string }>;
}

export async function searchPictograms(searchText: string, language = 'es'): Promise<ArasaacPictogram[]> {
  const trimmed = searchText.trim();
  if (!trimmed) return [];

  const url = `${ARASAAC_API}/pictograms/${language}/search/${encodeURIComponent(trimmed)}`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Error al buscar pictogramas: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return (data as ArasaacRawPictogram[]).map((item) => ({
    id: item._id,
    text: item.text || (item.keywords && item.keywords.length > 0 ? item.keywords[0].keyword : ''),
    imageUrl: `${ARASAAC_API}/pictograms/${item._id}?download=false`,
    previewUrl: `${ARASAAC_API}/pictograms/${item._id}?download=false&thumbnail=true`,
  }));
}
