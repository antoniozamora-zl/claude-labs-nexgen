import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import ReportsPage from './pages/ReportsPage';
import MetricsPage from './pages/MetricsPage';

function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-lg">
      {title} — proximamente
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <main className="max-w-5xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<MetricsPage />} />
            <Route path="/ordenes" element={<Placeholder title="Ordenes" />} />
            <Route path="/menu" element={<Placeholder title="Menu" />} />
            <Route path="/reportes" element={<ReportsPage />} />
            <Route path="/ajustes" element={<Placeholder title="Ajustes" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
