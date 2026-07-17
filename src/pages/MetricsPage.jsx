import { useState } from 'react';
import MetricsFilters from '../components/MetricsFilters';
import MetricsDashboard from '../components/MetricsDashboard';
import { getMetricsForRange, getTrendData } from '../data/mockData';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState(null);
  const [trendData, setTrendData] = useState([]);

  const handleGenerate = ({ startDate, endDate }) => {
    const calculatedMetrics = getMetricsForRange(startDate, endDate);
    const trend = getTrendData(startDate, endDate);

    setMetrics(calculatedMetrics);
    setTrendData(trend);
  };

  const handleExport = () => {
    if (!metrics || metrics.total === 0) {
      downloadCSV([], 'metrics');
      return;
    }

    const rows = [
      ['Métrica', 'Valor'],
      ['Total de Reportes', metrics.total],
      ['Aprobados', metrics.approved],
      ['Pendientes', metrics.pending],
      ['Rechazados', metrics.rejected],
      ['Tasa de Aprobación (%)', metrics.approvalRate],
      ['Tiempo Promedio de Revisión (días)', metrics.avgReviewTime],
      [],
      ['Fecha', 'Reportes'],
      ...trendData.map(d => [d.date, d.count]),
    ];

    downloadCSV(rows, 'metrics-' + new Date().toISOString().split('T')[0]);
  };

  const downloadCSV = (rows, filename) => {
    const csv = rows.map(row =>
      row.map(cell => {
        const str = String(cell || '');
        const needsQuote = str.includes(',') || str.includes('"') || str.includes('\n');
        return needsQuote ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasMetrics = metrics !== null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard de Métricas</h1>
      <MetricsFilters onGenerate={handleGenerate} />

      {hasMetrics && (
        <div className="mt-6">
          <MetricsDashboard
            metrics={metrics}
            trendData={trendData}
            onExport={handleExport}
          />
        </div>
      )}
    </div>
  );
}
