import { useState, useEffect, useCallback } from 'react';
import { Plus, ArrowLeft, CalendarDays, Trash2, Loader2, Image as ImageIcon, Check, Clock } from 'lucide-react';
import {
  getSchedules, createSchedule, deleteSchedule,
  getScheduleItems, addScheduleItem, deleteScheduleItem, toggleScheduleItemCompleted,
} from '@/lib/repo';
import type { Schedule, ScheduleItem, ArasaacPictogram } from '@/lib/types';
import PictogramPicker from '@/components/PictogramPicker';
import Modal from '@/components/Modal';

interface SchedulesPageProps {
  onBack: () => void;
  onView: (scheduleId: string) => void;
}

export default function SchedulesPage({ onBack, onView }: SchedulesPageProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [newTimeLabel, setNewTimeLabel] = useState('');

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSchedules();
      setSchedules(data);
    } catch (e) {
      console.error('Error loading schedules:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleCreate = async () => {
    if (!newName.trim()) return;

    try {
      const schedule = await createSchedule({ name: newName.trim() });
      setShowCreate(false);
      setNewName('');
      setSchedules([schedule, ...schedules]);
      onView(schedule.id);
    } catch (e) {
      console.error('Error creating schedule:', e);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteSchedule(id);
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const loadScheduleItems = useCallback(async (scheduleId: string) => {
    setItemsLoading(true);
    try {
      const data = await getScheduleItems(scheduleId);
      setScheduleItems(data);
    } catch (e) {
      console.error('Error loading schedule items:', e);
    }
    setItemsLoading(false);
  }, []);

  const openSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    loadScheduleItems(schedule.id);
  };

  const handleAddPictogram = async (pictogram: ArasaacPictogram) => {
    if (!selectedSchedule) return;

    const newPosition = scheduleItems.length;
    try {
      const item = await addScheduleItem({
        scheduleId: selectedSchedule.id,
        pictogramId: pictogram.id,
        pictogramText: pictogram.text,
        pictogramUrl: pictogram.previewUrl,
        timeLabel: newTimeLabel || null,
        position: newPosition,
      });
      setScheduleItems([...scheduleItems, item]);
    } catch (e) {
      console.error('Error adding schedule item:', e);
    }
    setNewTimeLabel('');
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteScheduleItem(itemId);
    setScheduleItems(scheduleItems.filter((item) => item.id !== itemId));
  };

  const toggleCompleted = async (item: ScheduleItem) => {
    try {
      await toggleScheduleItemCompleted(item.id, !item.completed);
      setScheduleItems(
        scheduleItems.map((it) => (it.id === item.id ? { ...it, completed: !it.completed } : it))
      );
    } catch (e) {
      console.error('Error toggling item:', e);
    }
  };

  if (selectedSchedule) {
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="bg-gradient-to-r from-accent-400 to-accent-500 pt-8 pb-20 md:pt-12 md:pb-24 border-b-4 border-accent-200">
          <div className="mx-auto max-w-6xl px-4">
            <button
              onClick={() => setSelectedSchedule(null)}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 font-secondary font-semibold transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a horarios
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center shadow-md">
                <CalendarDays size={32} className="text-accent-600" />
              </div>
              <div>
                <h1 className="font-primary font-bold text-3xl md:text-4xl text-gray-800">{selectedSchedule.name}</h1>
                <p className="font-secondary text-gray-700 text-lg">{scheduleItems.length} actividades</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 -mt-12">
          <div className="card-container mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="block font-secondary font-semibold text-gray-700 mb-2">Hora (opcional)</label>
                <input
                  type="text"
                  value={newTimeLabel}
                  onChange={(e) => setNewTimeLabel(e.target.value)}
                  placeholder="Ej: 8:00 AM"
                  className="w-full rounded-2xl border-2 border-gray-200 py-3 px-4 font-secondary text-lg text-gray-700 focus:border-accent-400 focus:outline-none transition-colors"
                />
              </div>
              <button onClick={() => setShowPicker(true)} className="btn-accent w-full sm:w-auto">
                <Plus size={22} />
                Añadir Actividad
              </button>
            </div>
          </div>

          {itemsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 size={48} className="animate-spin mb-4 text-accent-400" />
            </div>
          ) : scheduleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-24 h-24 rounded-3xl bg-accent-50 flex items-center justify-center mb-4">
                <ImageIcon size={48} className="text-accent-300" />
              </div>
              <p className="font-secondary text-lg">No hay actividades en este horario</p>
              <p className="font-secondary text-sm mt-1">Añade actividades para crear una rutina visual</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {scheduleItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`group flex items-center gap-4 rounded-3xl border-2 p-4 transition-all animate-fade-in ${
                    item.completed
                      ? 'bg-success-50 border-success-200'
                      : 'bg-white border-gray-200 hover:border-accent-200'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.time_label && (
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-accent-100 border-2 border-accent-200">
                      <Clock size={18} className="text-accent-600 mb-1" />
                      <span className="font-primary font-bold text-sm text-accent-700 text-center">{item.time_label}</span>
                    </div>
                  )}

                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white border-2 border-gray-100 overflow-hidden flex items-center justify-center">
                    <img
                      src={item.pictogram_url}
                      alt={item.pictogram_text}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={`font-primary font-bold text-lg capitalize ${item.completed ? 'text-success-700 line-through' : 'text-gray-800'}`}>
                      {item.pictogram_text}
                    </span>
                    {item.completed && (
                      <span className="block font-secondary text-sm text-success-600">Completado</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCompleted(item)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
                        item.completed
                          ? 'bg-success-500 text-white hover:bg-success-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-success-100 hover:text-success-500'
                      }`}
                      title={item.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                    >
                      <Check size={22} strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="w-11 h-11 rounded-2xl flex items-center justify-center bg-error-50 text-error-400 hover:bg-error-100 transition-all active:scale-90"
                    >
                      <Trash2 size={20} />
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

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="bg-gradient-to-r from-accent-400 to-accent-500 pt-8 pb-20 md:pt-12 md:pb-24">
        <div className="mx-auto max-w-6xl px-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 font-secondary font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 className="font-primary font-bold text-3xl md:text-4xl text-gray-800 mb-2">
            Horarios Visuales
          </h1>
          <p className="font-secondary text-gray-700 text-lg">
            Crea rutinas paso a paso con pictogramas
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 -mt-12">
        <div className="flex justify-end mb-4">
          <button onClick={() => setShowCreate(true)} className="btn-accent">
            <Plus size={22} />
            Nuevo Horario
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={48} className="animate-spin mb-4 text-accent-400" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-24 h-24 rounded-3xl bg-accent-50 flex items-center justify-center mb-4">
              <CalendarDays size={48} className="text-accent-300" />
            </div>
            <p className="font-secondary text-lg">No hay horarios creados</p>
            <p className="font-secondary text-sm mt-1">Crea tu primer horario visual</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((schedule, index) => (
              <div
                key={schedule.id}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-50 to-accent-100 border-2 border-accent-200 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <button
                  onClick={() => openSchedule(schedule)}
                  className="w-full p-6 text-left"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent-400 flex items-center justify-center shadow-md mb-4 transition-transform group-hover:scale-110">
                    <CalendarDays size={28} className="text-white" />
                  </div>
                  <h3 className="font-primary font-bold text-xl text-gray-800 mb-1">{schedule.name}</h3>
                  <p className="font-secondary text-gray-600 text-sm">Horario visual</p>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(schedule.id); }}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/60 flex items-center justify-center text-error-400 hover:bg-error-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Horario">
        <div className="flex flex-col gap-5">
          <div>
            <label className="block font-secondary font-semibold text-gray-700 mb-2">Nombre del horario</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej: Rutina de la mañana"
              autoFocus
              className="w-full rounded-2xl border-2 border-gray-200 py-3 px-4 font-secondary text-lg text-gray-700 focus:border-accent-400 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-3 justify-end mt-2">
            <button onClick={() => setShowCreate(false)} className="btn-ghost">Cancelar</button>
            <button onClick={handleCreate} disabled={!newName.trim()} className="btn-accent disabled:opacity-50">
              Crear Horario
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
