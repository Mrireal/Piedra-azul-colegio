import {
  Image as ImageIcon,
  LayoutGrid,
  CalendarDays,
  Users,
  Heart,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import type { PageView } from '@/lib/types';

interface HomePageProps {
  onNavigate: (page: PageView) => void;
}

const sections: Array<{
  title: string;
  description: string;
  icon: typeof ImageIcon;
  page: PageView;
  bgGradient: string;
  iconBg: string;
}> = [
  {
    title: 'Pictogramas',
    description: 'Busca y explora pictogramas visuales',
    icon: ImageIcon,
    page: { name: 'pictograms' },
    bgGradient: 'from-secondary-50 to-secondary-100',
    iconBg: 'bg-secondary-400',
  },
  {
    title: 'Tableros de Comunicación',
    description: 'Crea tableros con pictogramas para comunicarse',
    icon: LayoutGrid,
    page: { name: 'boards' },
    bgGradient: 'from-success-50 to-success-100',
    iconBg: 'bg-success-400',
  },
  {
    title: 'Horarios Visuales',
    description: 'Organiza rutinas con pictogramas paso a paso',
    icon: CalendarDays,
    page: { name: 'schedules' },
    bgGradient: 'from-accent-50 to-accent-100',
    iconBg: 'bg-accent-400',
  },
  {
    title: 'Estudiantes',
    description: 'Gestiona perfiles de los estudiantes NEE',
    icon: Users,
    page: { name: 'students' },
    bgGradient: 'from-primary-50 to-primary-100',
    iconBg: 'bg-primary-400',
  },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 pb-16 pt-12 md:pt-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
          <div className="absolute top-20 right-20 w-60 h-60 rounded-full bg-accent-300 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-success-300 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 mb-6">
            <Heart size={18} className="text-white" />
            <span className="font-secondary text-white text-sm font-semibold">Área PIE - Educación Inclusiva</span>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-3xl bg-white/90 flex items-center justify-center shadow-xl animate-float">
              <Sparkles size={48} className="text-primary-500" />
            </div>
          </div>

          <h1 className="font-primary font-bold text-3xl md:text-5xl text-white mb-3">
            Colegio Técnico Profesional
          </h1>
          <h2 className="font-primary font-bold text-2xl md:text-4xl text-accent-200 mb-4">
            Piedra Azul
          </h2>
          <p className="font-secondary text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Sistema visual de pictogramas para niños con Necesidades Educativas Especiales
          </p>
        </div>

        <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 80V40C240 0 480 0 720 30C960 60 1200 80 1440 40V80H0Z" fill="#f8fafc" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 -mt-8 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <button
                key={section.title}
                onClick={() => onNavigate(section.page)}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${section.bgGradient} p-8 text-left shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] animate-fade-in`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-start gap-5">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${section.iconBg} flex items-center justify-center shadow-md transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon size={32} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-primary font-bold text-xl md:text-2xl text-gray-800 mb-1">
                      {section.title}
                    </h3>
                    <p className="font-secondary text-gray-600 text-base">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 opacity-10 transition-opacity group-hover:opacity-20">
                  <Icon size={120} className="text-gray-800" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="mt-8 rounded-3xl bg-white border border-gray-100 shadow-lg p-6 md:p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <BookOpen size={32} className="text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-primary font-bold text-lg text-gray-800 mb-1">
                Pictogramas de ARASAAC
              </h3>
              <p className="font-secondary text-gray-600 text-sm">
                Los pictogramas utilizados en este sistema provienen de ARASAAC (Portal Aragonés de la Comunicación Aumentativa y Alternativa), creados por Sergio Palao bajo licencia Creative Commons BY-NC-SA.
              </p>
            </div>
            <a
              href="https://arasaac.org"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-sm whitespace-nowrap"
            >
              Visitar ARASAAC
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
