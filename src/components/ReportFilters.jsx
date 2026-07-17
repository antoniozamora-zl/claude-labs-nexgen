import { useState } from 'react';

export default function ReportFilters({ onGenerate }) {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [reportType, setReportType] = useState('ordenes');
  const [startDate, setStartDate] = useState(firstOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({ reportType, startDate, endDate });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4 mb-6">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-500 font-medium">Tipo de reporte</label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="ordenes">Ordenes</option>
          <option value="ventas">Ventas</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-500 font-medium">Fecha inicio</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-500 font-medium">Fecha fin</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <button
        type="submit"
        className="px-5 py-2 bg-[#e94560] text-white rounded-lg text-sm font-medium hover:bg-[#d63850] transition-colors"
      >
        Generar preview
      </button>
    </form>
  );
}
