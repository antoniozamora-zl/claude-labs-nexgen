import { formatCurrency, formatDate } from '../utils/dateFormatter';

export default function ReportSummary({ data, startDate, endDate, reportType }) {
  if (!data || data.length === 0) return null;

  if (reportType === 'ventas') {
    const totalItems = data.reduce((sum, item) => sum + item.cantidadVendida, 0);
    const totalIngreso = data.reduce((sum, item) => sum + item.ingresoTotal, 0);
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SummaryCard label="Productos distintos" value={data.length} />
        <SummaryCard label="Unidades vendidas" value={totalItems} />
        <SummaryCard label="Ingreso total" value={formatCurrency(totalIngreso)} />
        <SummaryCard label="Periodo" value={`${formatDate(startDate)} - ${formatDate(endDate)}`} small />
      </div>
    );
  }

  const totalOrdenes = data.length;
  const totalIngreso = data.filter(o => o.estado === 'Completada').reduce((sum, o) => sum + o.total, 0);
  const ticketPromedio = totalOrdenes > 0 ? totalIngreso / data.filter(o => o.estado === 'Completada').length : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <SummaryCard label="Total ordenes" value={totalOrdenes} />
      <SummaryCard label="Ingreso total" value={formatCurrency(totalIngreso)} />
      <SummaryCard label="Ticket promedio" value={formatCurrency(ticketPromedio)} />
      <SummaryCard label="Periodo" value={`${formatDate(startDate)} - ${formatDate(endDate)}`} small />
    </div>
  );
}

function SummaryCard({ label, value, small }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
      <div className={`font-semibold mt-1 ${small ? 'text-base' : 'text-2xl'}`}>{value}</div>
    </div>
  );
}
