import { useState, useEffect, useCallback } from 'react';
import { Plus, ArrowLeft, LayoutGrid, Trash2, Loader2, Image as ImageIcon, Volume2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Board, BoardItem, ArasaacPictogram } from '@/lib/types';
import PictogramPicker from '@/components/PictogramPicker';
import Modal from '@/components/Modal';

interface BoardsPageProps {
  onBack: () => void;
  onView: (boardId: string) => void;
}

const boardColors: Array<{ name: string; label: string; classes: string; iconClasses: string }> = [
  { name: 'sky', label: 'Azul', classes: 'from-primary-50 to-primary-100 border-primary-200', iconClasses: 'bg-primary-400' },
  { name: 'orange', label: 'Naranja', classes: 'from-secondary-50 to-secondary-100 border-secondary-200', iconClasses: 'bg-secondary-400' },
  { name: 'green', label: 'Verde', classes: 'from-success-50 to-success-100 border-success-200', iconClasses: 'bg-success-400' },
  { name: 'yellow', label: 'Amarillo', classes: 'from-accent-50 to-accent-100 border-accent-200', iconClasses: 'bg-accent-400' },
];

export default function BoardsPage({ onBack, onView }: BoardsPageProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('sky');
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);

  const loadBoards = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBoards(data as Board[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const handleCreate = async () => {
    if (!newName.trim()) return;

    const { data, error } = await supabase
      .from('boards')
      .insert({ name: newName.trim(), color: newColor })
      .select()
      .maybeSingle();

    if (!error && data) {
      setShowCreate(false);
      setNewName('');
      setNewColor('sky');
      setBoards([data as Board, ...boards]);
      onView((data as Board).id);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('boards').delete().eq('id', id);
    setBoards(boards.filter((b) => b.id !== id));
  };

  const loadBoardItems = useCallback(async (boardId: string) => {
    setItemsLoading(true);
    const { data, error } = await supabase
      .from('board_items')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    if (!error && data) {
      setBoardItems(data as BoardItem[]);
    }
    setItemsLoading(false);
  }, []);

  const openBoard = (board: Board) => {
    setSelectedBoard(board);
    loadBoardItems(board.id);
  };

  const handleAddPictogram = async (pictogram: ArasaacPictogram) => {
    if (!selectedBoard) return;

    const newPosition = boardItems.length;

    const { data, error } = await supabase
      .from('board_items')
      .insert({
        board_id: selectedBoard.id,
        pictogram_id: pictogram.id,
        pictogram_text: pictogram.text,
        pictogram_url: pictogram.previewUrl,
        position: newPosition,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      setBoardItems([...boardItems, data as BoardItem]);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    await supabase.from('board_items').delete().eq('id', itemId);
    setBoardItems(boardItems.filter((item) => item.id !== itemId));
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const getColorClasses = (colorName: string) => {
    return boardColors.find((c) => c.name === colorName) || boardColors[0];
  };

  // Board Detail View
  if (selectedBoard) {
    const colorInfo = getColorClasses(selectedBoard.color);
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className={`bg-gradient-to-r ${colorInfo.classes} pt-8 pb-20 md:pt-12 md:pb-24 border-b-4`}>
          <div className="mx-auto max-w-6xl px-4">
            <button
              onClick={() => setSelectedBoard(null)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 font-secondary font-semibold transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a tableros
            </button>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${colorInfo.iconClasses} flex items-center justify-center shadow-md`}>
                <LayoutGrid size={32} className="text-white" />
              </div>
              <div>
                <h1 className="font-primary font-bold text-3xl md:text-4xl text-gray-800">{selectedBoard.name}</h1>
                <p className="font-secondary text-gray-600 text-lg">{boardItems.length} pictogramas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 -mt-12">
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowPicker(true)} className="btn-primary">
              <Plus size={22} />
              Añadir Pictograma
            </button>
          </div>

          {itemsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 size={48} className="animate-spin mb-4 text-primary-400" />
            </div>
          ) : boardItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-24 h-24 rounded-3xl bg-primary-50 flex items-center justify-center mb-4">
                <ImageIcon size={48} className="text-primary-300" />
              </div>
              <p className="font-secondary text-lg">Este tablero está vacío</p>
              <p className="font-secondary text-sm mt-1">Añade pictogramas para comenzar a comunicar</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {boardItems.map((item, index) => (
                <div
                  key={item.id}
                  className="pictogram-card group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button onClick={() => speakText(item.pictogram_text)} className="w-full">
                    <img
                      src={item.pictogram_url}
                      alt={item.pictogram_text}
                      className="pictogram-card-image"
                    />
                    <span className="pictogram-card-label capitalize">{item.pictogram_text}</span>
                  </button>
                  <div className="flex items-center justify-between mt-2 w-full">
                    <button
                      onClick={() => speakText(item.pictogram_text)}
                      className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-500 hover:bg-primary-100 transition-colors"
                    >
                      <Volume2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="w-9 h-9 rounded-full bg-error-50 flex items-center justify-center text-error-400 hover:bg-error-100 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <PictogramPicker open={showPicker} onClose={() => setShowPicker(false)} onSelect={handleAddPictogram} />
      </div>
    );
  }

  // Board List View
  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="bg-gradient-to-r from-success-400 to-success-600 pt-8 pb-20 md:pt-12 md:pb-24">
        <div className="mx-auto max-w-6xl px-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 font-secondary font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 className="font-primary font-bold text-3xl md:text-4xl text-white mb-2">
            Tableros de Comunicación
          </h1>
          <p className="font-secondary text-white/80 text-lg">
            Crea tableros con pictogramas para facilitar la comunicación
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 -mt-12">
        <div className="flex justify-end mb-4">
          <button onClick={() => setShowCreate(true)} className="btn-success">
            <Plus size={22} />
            Nuevo Tablero
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={48} className="animate-spin mb-4 text-success-400" />
          </div>
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-24 h-24 rounded-3xl bg-success-50 flex items-center justify-center mb-4">
              <LayoutGrid size={48} className="text-success-300" />
            </div>
            <p className="font-secondary text-lg">No hay tableros creados</p>
            <p className="font-secondary text-sm mt-1">Crea tu primer tablero de comunicación</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board, index) => {
              const colorInfo = getColorClasses(board.color);
              return (
                <div
                  key={board.id}
                  className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${colorInfo.classes} border-2 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] animate-fade-in`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <button
                    onClick={() => openBoard(board)}
                    className="w-full p-6 text-left"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${colorInfo.iconClasses} flex items-center justify-center shadow-md mb-4 transition-transform group-hover:scale-110`}>
                      <LayoutGrid size={28} className="text-white" />
                    </div>
                    <h3 className="font-primary font-bold text-xl text-gray-800 mb-1">{board.name}</h3>
                    <p className="font-secondary text-gray-600 text-sm">Tablero de comunicación</p>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(board.id); }}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/60 flex items-center justify-center text-error-400 hover:bg-error-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Tablero">
        <div className="flex flex-col gap-5">
          <div>
            <label className="block font-secondary font-semibold text-gray-700 mb-2">Nombre del tablero</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej: Comunicación diaria"
              autoFocus
              className="w-full rounded-2xl border-2 border-gray-200 py-3 px-4 font-secondary text-lg text-gray-700 focus:border-success-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-secondary font-semibold text-gray-700 mb-2">Color del tablero</label>
            <div className="flex flex-wrap gap-3">
              {boardColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setNewColor(color.name)}
                  className={`w-12 h-12 rounded-2xl ${color.iconClasses} transition-all ${
                    newColor === color.name ? 'ring-4 ring-offset-2 ring-gray-300 scale-110' : 'hover:scale-105'
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-2">
            <button onClick={() => setShowCreate(false)} className="btn-ghost">Cancelar</button>
            <button onClick={handleCreate} disabled={!newName.trim()} className="btn-success disabled:opacity-50">
              Crear Tablero
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
