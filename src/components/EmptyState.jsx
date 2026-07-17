export default function EmptyState({ message = 'No hay datos para este rango', hint = 'Selecciona un periodo diferente para generar el reporte.' }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-5xl mb-3">📋</div>
      <p className="text-lg font-semibold text-gray-500">{message}</p>
      <p className="text-sm mt-1">{hint}</p>
    </div>
  );
}
