import { useState, useEffect, useCallback } from 'react';
import { Plus, ArrowLeft, Users, Trash2, Loader2, Pencil, Save, X } from 'lucide-react';
import { getStudents, createStudent, updateStudent, deleteStudent } from '@/lib/repo';
import type { Student } from '@/lib/types';
import Modal from '@/components/Modal';

interface StudentsPageProps {
  onBack: () => void;
}

const avatarColors = [
  'bg-primary-400', 'bg-secondary-400', 'bg-success-400', 'bg-accent-400',
  'bg-warning-400', 'bg-error-400',
];

function getAvatarColor(name: string): string {
  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return avatarColors[charSum % avatarColors.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function StudentsPage({ onBack }: StudentsPageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [notes, setNotes] = useState('');

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (e) {
      console.error('Error loading students:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setGrade('');
    setNotes('');
    setShowModal(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setName(student.name);
    setGrade(student.grade || '');
    setNotes(student.notes || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      if (editing) {
        await updateStudent(editing.id, {
          name: name.trim(),
          grade: grade.trim() || null,
          notes: notes.trim() || null,
        });
        setStudents(
          students.map((s) =>
            s.id === editing.id
              ? { ...s, name: name.trim(), grade: grade.trim() || null, notes: notes.trim() || null }
              : s
          )
        );
      } else {
        const student = await createStudent({
          name: name.trim(),
          grade: grade.trim() || null,
          notes: notes.trim() || null,
        });
        setStudents([...students, student].sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (e) {
      console.error('Error saving student:', e);
    }

    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    await deleteStudent(id);
    setStudents(students.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="bg-gradient-to-r from-warning-400 to-warning-600 pt-8 pb-20 md:pt-12 md:pb-24">
        <div className="mx-auto max-w-6xl px-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 font-secondary font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 className="font-primary font-bold text-3xl md:text-4xl text-white mb-2">
            Estudiantes
          </h1>
          <p className="font-secondary text-white/80 text-lg">
            Gestiona los perfiles de los estudiantes NEE
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 -mt-12">
        <div className="flex justify-end mb-4">
          <button onClick={openCreate} className="btn-primary">
            <Plus size={22} />
            Nuevo Estudiante
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={48} className="animate-spin mb-4 text-warning-400" />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-24 h-24 rounded-3xl bg-warning-50 flex items-center justify-center mb-4">
              <Users size={48} className="text-warning-300" />
            </div>
            <p className="font-secondary text-lg">No hay estudiantes registrados</p>
            <p className="font-secondary text-sm mt-1">Añade el primer estudiante</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student, index) => (
              <div
                key={student.id}
                className="group card-container hover:shadow-xl transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${getAvatarColor(student.name)} flex items-center justify-center shadow-md`}>
                    <span className="font-primary font-bold text-2xl text-white">{getInitials(student.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-primary font-bold text-lg text-gray-800 truncate">{student.name}</h3>
                    {student.grade && (
                      <span className="inline-block mt-1 rounded-full bg-primary-50 px-3 py-1 font-secondary text-sm text-primary-600 font-semibold">
                        {student.grade}
                      </span>
                    )}
                    {student.notes && (
                      <p className="font-secondary text-sm text-gray-500 mt-2 line-clamp-2">{student.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => openEdit(student)}
                    className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 hover:bg-primary-100 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="w-10 h-10 rounded-xl bg-error-50 flex items-center justify-center text-error-400 hover:bg-error-100 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Estudiante' : 'Nuevo Estudiante'}>
        <div className="flex flex-col gap-5">
          <div>
            <label className="block font-secondary font-semibold text-gray-700 mb-2">Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: María González"
              autoFocus
              className="w-full rounded-2xl border-2 border-gray-200 py-3 px-4 font-secondary text-lg text-gray-700 focus:border-primary-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-secondary font-semibold text-gray-700 mb-2">Curso/Grado</label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Ej: 1° básico"
              className="w-full rounded-2xl border-2 border-gray-200 py-3 px-4 font-secondary text-lg text-gray-700 focus:border-primary-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-secondary font-semibold text-gray-700 mb-2">Notas del educador</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información relevante sobre el estudiante..."
              rows={3}
              className="w-full rounded-2xl border-2 border-gray-200 py-3 px-4 font-secondary text-lg text-gray-700 focus:border-primary-400 focus:outline-none transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end mt-2">
            <button onClick={() => setShowModal(false)} className="btn-ghost">
              <X size={20} />
              Cancelar
            </button>
            <button onClick={handleSave} disabled={!name.trim()} className="btn-primary disabled:opacity-50">
              <Save size={20} />
              {editing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
