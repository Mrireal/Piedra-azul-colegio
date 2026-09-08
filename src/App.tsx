import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HomePage from '@/pages/HomePage';
import PictogramsPage from '@/pages/PictogramsPage';
import BoardsPage from '@/pages/BoardsPage';
import SchedulesPage from '@/pages/SchedulesPage';
import StudentsPage from '@/pages/StudentsPage';
import type { PageView } from '@/lib/types';

function App() {
  const [page, setPage] = useState<PageView>({ name: 'home' });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const renderPage = () => {
    switch (page.name) {
      case 'home':
        return <HomePage onNavigate={setPage} />;
      case 'pictograms':
        return <PictogramsPage onBack={() => setPage({ name: 'home' })} />;
      case 'boards':
        return <BoardsPage onBack={() => setPage({ name: 'home' })} onView={(boardId) => setPage({ name: 'board-view', boardId })} />;
      case 'schedules':
        return <SchedulesPage onBack={() => setPage({ name: 'home' })} onView={(scheduleId) => setPage({ name: 'schedule-view', scheduleId })} />;
      case 'students':
        return <StudentsPage onBack={() => setPage({ name: 'home' })} />;
      default:
        return <HomePage onNavigate={setPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation current={page} onNavigate={setPage} />
      <main className="pt-16 md:pt-20">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
