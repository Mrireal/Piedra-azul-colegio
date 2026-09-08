import { Home, Image, LayoutGrid, CalendarDays, Users } from 'lucide-react';
import type { PageView } from '@/lib/types';

interface NavigationProps {
  current: PageView;
  onNavigate: (page: PageView) => void;
}

const navItems: Array<{ key: string; label: string; icon: typeof Home; page: PageView; color: string }> = [
  { key: 'home', label: 'Inicio', icon: Home, page: { name: 'home' }, color: 'text-primary-500' },
  { key: 'pictograms', label: 'Pictogramas', icon: Image, page: { name: 'pictograms' }, color: 'text-secondary-500' },
  { key: 'boards', label: 'Tableros', icon: LayoutGrid, page: { name: 'boards' }, color: 'text-success-500' },
  { key: 'schedules', label: 'Horarios', icon: CalendarDays, page: { name: 'schedules' }, color: 'text-accent-500' },
  { key: 'students', label: 'Estudiantes', icon: Users, page: { name: 'students' }, color: 'text-warning-600' },
];

export default function Navigation({ current, onNavigate }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-primary-100 shadow-lg md:top-0 md:bottom-auto md:border-t-0 md:border-b-4 md:shadow-md">
      <div className="mx-auto max-w-6xl px-2">
        <div className="flex items-center justify-between md:justify-center md:gap-2">
          <div className="hidden md:flex items-center gap-2 mr-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white font-primary font-bold text-lg">P</span>
            </div>
            <div className="flex flex-col">
              <span className="font-primary font-bold text-primary-700 text-sm leading-tight">Piedra Azul</span>
              <span className="font-secondary text-xs text-gray-400 leading-tight">Área PIE</span>
            </div>
          </div>

          {navItems.map((item) => {
            const isActive = current.name === item.page.name;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.page)}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-3 md:px-6 md:py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? `${item.color} bg-gray-50 md:bg-primary-50 scale-105`
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon
                  size={26}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? 'animate-pop' : ''}
                />
                <span className="font-secondary text-xs md:text-sm font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
