import { useState } from 'react';
import ReportFilters from '../components/ReportFilters';
import ReportSummary from '../components/ReportSummary';
import ReportTable from '../components/ReportTable';
import EmptyState from '../components/EmptyState';
import { getOrdersInRange, getSalesInRange } from '../data/mockData';
import { generatePDF } from '../services/pdfGenerator';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = ({ reportType, startDate, endDate }) => {
    const result = reportType === 'ordenes'
      ? getOrdersInRange(startDate, endDate)
      : getSalesInRange(startDate, endDate);
    setData(result);
    setFilters({ reportType, startDate, endDate });
  };

  const handleDownload = () => {
    setGenerating(true);
    setTimeout(() => {
      generatePDF({ data, ...filters });
      setGenerating(false);
    }, 500);
  };

  const hasData = data !== null;
  const hasResults = hasData && data.length > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reportes</h1>
      <ReportFilters onGenerate={handleGenerate} />

      {hasData && !hasResults && <EmptyState />}

      {hasResults && (
        <>
          <ReportSummary
            data={data}
            startDate={filters.startDate}
            endDate={filters.endDate}
            reportType={filters.reportType}
          />

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500">
              Preview de datos
              <span className="ml-2 inline-block text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                Reporte: {filters.reportType === 'ordenes' ? 'Ordenes' : 'Ventas'}
              </span>
            </h2>
          </div>

          <ReportTable data={data} reportType={filters.reportType} />

          <div className="flex justify-end mt-4">
            <button
              onClick={handleDownload}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2 bg-[#16213e] text-white rounded-lg text-sm font-medium hover:bg-[#1a2a4a] transition-colors disabled:opacity-50"
            >
              {generating ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
