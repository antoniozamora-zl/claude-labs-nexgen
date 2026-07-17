import { useMemo } from 'react';

export default function MetricsDashboard({ metrics, trendData, onExport }) {
  const isEmpty = metrics.total === 0;

  const maxCount = useMemo(() => {
    return Math.max(...trendData.map(d => d.count), 1);
  }, [trendData]);

  return (
    <div
      data-verify="metrics-dashboard"
      data-empty={isEmpty || undefined}
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Métricas de Reportes</h2>
        <button
          data-action="export-csv"
          onClick={onExport}
          disabled={false}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          ⬇️ Exportar CSV
        </button>
      </div>

      {isEmpty ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-base">No hay reportes en este rango</p>
          <p className="text-sm mt-1">Intenta con otras fechas</p>
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {/* Total */}
            <div
              data-metric="total"
              data-value={metrics.total}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
            >
              <div className="text-2xl font-bold text-blue-900">{metrics.total}</div>
              <div className="text-xs font-medium text-blue-700 mt-1 uppercase tracking-wide">Total Reportes</div>
            </div>

            {/* Approval Rate */}
            <div
              data-metric="approval-rate"
              data-value={metrics.approvalRate}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200"
            >
              <div className="text-2xl font-bold text-purple-900">{metrics.approvalRate}%</div>
              <div className="text-xs font-medium text-purple-700 mt-1 uppercase tracking-wide">Tasa Aprobación</div>
            </div>

            {/* Status Breakdown — all three on ONE element for contract */}
            <div
              data-metric="status-breakdown"
              data-approved={metrics.approved}
              data-pending={metrics.pending}
              data-rejected={metrics.rejected}
              className="col-span-2 md:col-span-3 grid grid-cols-3 gap-4"
            >
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-900">{metrics.approved}</div>
                <div className="text-xs font-medium text-green-700 mt-1 uppercase tracking-wide">Aprobados</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-900">{metrics.pending}</div>
                <div className="text-xs font-medium text-yellow-700 mt-1 uppercase tracking-wide">Pendientes</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-900">{metrics.rejected}</div>
                <div className="text-xs font-medium text-red-700 mt-1 uppercase tracking-wide">Rechazados</div>
              </div>
            </div>

            {/* Avg Review Time */}
            <div
              data-metric="avg-review-time"
              data-value={metrics.avgReviewTime}
              className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200"
            >
              <div className="text-2xl font-bold text-indigo-900">{metrics.avgReviewTime}d</div>
              <div className="text-xs font-medium text-indigo-700 mt-1 uppercase tracking-wide">Días Promedio</div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tendencia (últimos 14 días)</h3>
            <div
              data-metric="daily-trend"
              data-json={JSON.stringify(trendData)}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-end justify-between gap-1 h-32">
                {trendData.map((day, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center"
                    title={`${day.date}: ${day.count} reportes`}
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors"
                      style={{
                        height: `${(day.count / maxCount) * 100}%`,
                        minHeight: day.count > 0 ? '4px' : '1px',
                      }}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {new Date(day.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
