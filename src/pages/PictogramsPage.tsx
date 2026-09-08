import { useState } from 'react';
import { Search, Loader2, Image as ImageIcon, ArrowLeft, Volume2 } from 'lucide-react';
import { searchPictograms } from '@/lib/arasaac';
import type { ArasaacPictogram } from '@/lib/types';

interface PictogramsPageProps {
  onBack: () => void;
}

const quickSearchTerms = [
  'comer', 'beber', 'escuela', 'jugar', 'familia',
  'feliz', 'triste', 'dormir', 'baño', 'hola',
];

export default function PictogramsPage({ onBack }: PictogramsPageProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ArasaacPictogram[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchText: string) => {
    if (!searchText.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setQuery(searchText);

    try {
      const data = await searchPictograms(searchText);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar pictogramas');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-400 to-secondary-600 pt-8 pb-20 md:pt-12 md:pb-24">
        <div className="mx-auto max-w-6xl px-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 font-secondary font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 className="font-primary font-bold text-3xl md:text-4xl text-white mb-2">
            Buscar Pictogramas
          </h1>
          <p className="font-secondary text-white/80 text-lg">
            Encuentra el pictograma que necesitas
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 -mt-12">
        {/* Search Bar */}
        <div className="card-container mb-6">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}
            className="flex gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribe una palabra..."
                className="w-full rounded-2xl border-2 border-gray-200 py-3 pl-12 pr-4 font-secondary text-lg text-gray-700 focus:border-secondary-400 focus:outline-none transition-colors"
              />
            </div>
            <button type="submit" disabled={loading || !query.trim()} className="btn-secondary disabled:opacity-50">
              {loading ? <Loader2 size={22} className="animate-spin" /> : <Search size={22} />}
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </form>

          {/* Quick Search Terms */}
          {!hasSearched && (
            <div className="mt-6">
              <p className="font-secondary text-gray-500 text-sm mb-3">Búsquedas rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickSearchTerms.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="rounded-full bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 px-4 py-2 font-secondary font-semibold text-secondary-700 text-sm capitalize transition-all hover:scale-105 active:scale-95"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-3xl bg-error-50 border border-error-200 p-6 mb-6 text-error-700 font-secondary text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={48} className="animate-spin mb-4 text-secondary-400" />
            <p className="font-secondary text-lg">Buscando pictogramas...</p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ImageIcon size={56} className="mb-4" />
            <p className="font-secondary text-lg">No se encontraron pictogramas para "{query}"</p>
            <p className="font-secondary text-sm mt-1">Intenta con otra palabra</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="font-secondary text-gray-500 mb-4">
              {results.length} pictograma{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((pictogram, index) => (
                <button
                  key={pictogram.id}
                  onClick={() => speakText(pictogram.text)}
                  className="pictogram-card hover:border-secondary-400 animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="relative w-full">
                    <img
                      src={pictogram.previewUrl}
                      alt={pictogram.text}
                      className="pictogram-card-image"
                      loading="lazy"
                    />
                    <div className="absolute top-1 right-1 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Volume2 size={16} className="text-secondary-500" />
                    </div>
                  </div>
                  <span className="pictogram-card-label capitalize">{pictogram.text}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-24 h-24 rounded-3xl bg-secondary-50 flex items-center justify-center mb-4">
              <ImageIcon size={48} className="text-secondary-300" />
            </div>
            <p className="font-secondary text-lg">Busca pictogramas escribiendo una palabra</p>
            <p className="font-secondary text-sm mt-1">Toca un pictograma para escucharlo</p>
          </div>
        )}
      </div>
    </div>
  );
}
