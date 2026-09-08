import { useState } from 'react';
import { Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { searchPictograms } from '@/lib/arasaac';
import type { ArasaacPictogram } from '@/lib/types';

interface PictogramPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (pictogram: ArasaacPictogram) => void;
}

export default function PictogramPicker({ open, onClose, onSelect }: PictogramPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ArasaacPictogram[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await searchPictograms(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar pictogramas');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (pictogram: ArasaacPictogram) => {
    onSelect(pictogram);
    setQuery('');
    setResults([]);
    setHasSearched(false);
    onClose();
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-primary font-bold text-2xl text-gray-800">Buscar Pictograma</h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 overflow-hidden flex-1">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribe una palabra..."
                autoFocus
                className="w-full rounded-2xl border-2 border-gray-200 py-3 pl-12 pr-4 font-secondary text-lg text-gray-700 focus:border-primary-400 focus:outline-none transition-colors"
              />
            </div>
            <button type="submit" disabled={loading || !query.trim()} className="btn-primary disabled:opacity-50">
              {loading ? <Loader2 size={22} className="animate-spin" /> : <Search size={22} />}
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </form>

          {error && (
            <div className="rounded-2xl bg-error-50 border border-error-200 p-4 text-error-700 font-secondary">
              {error}
            </div>
          )}

          <div className="overflow-y-auto flex-1">
            {!hasSearched && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ImageIcon size={48} className="mb-4" />
                <p className="font-secondary text-lg">Escribe una palabra para buscar pictogramas</p>
                <p className="font-secondary text-sm mt-1">Ej: comer, jugar, escuela, agua</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Loader2 size={40} className="animate-spin mb-4 text-primary-400" />
                <p className="font-secondary text-lg">Buscando pictogramas...</p>
              </div>
            )}

            {!loading && hasSearched && results.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ImageIcon size={48} className="mb-4" />
                <p className="font-secondary text-lg">No se encontraron pictogramas</p>
                <p className="font-secondary text-sm mt-1">Intenta con otra palabra</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {results.map((pictogram) => (
                  <button
                    key={pictogram.id}
                    onClick={() => handleSelect(pictogram)}
                    className="pictogram-card hover:border-secondary-400 animate-fade-in"
                  >
                    <img
                      src={pictogram.previewUrl}
                      alt={pictogram.text}
                      className="pictogram-card-image"
                      loading="lazy"
                    />
                    <span className="pictogram-card-label text-sm capitalize">{pictogram.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
