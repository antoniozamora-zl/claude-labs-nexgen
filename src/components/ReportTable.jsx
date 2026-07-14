import { formatDate, formatCurrency } from '../utils/dateFormatter';

export default function ReportTable({ data, reportType }) {
  if (!data || data.length === 0) return null;

  if (reportType === 'ventas') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Producto</th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Precio unit.</th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Cantidad</th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Ingreso</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2.5">{item.nombre}</td>
                <td className="px-3 py-2.5">{formatCurrency(item.precio)}</td>
                <td className="px-3 py-2.5">{item.cantidadVendida}</td>
                <td className="px-3 py-2.5">{formatCurrency(item.ingresoTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-200">
            <th className="text-left px-3 py-2.5 font-semibold text-gray-500">#</th>
            <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Fecha</th>
            <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Cliente</th>
            <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Items</th>
            <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Total</th>
            <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((order) => (
            <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2.5">{order.id}</td>
              <td className="px-3 py-2.5">{formatDate(order.fecha)}</td>
              <td className="px-3 py-2.5">{order.cliente}</td>
              <td className="px-3 py-2.5">{order.numItems}</td>
              <td className="px-3 py-2.5">{formatCurrency(order.total)}</td>
              <td className="px-3 py-2.5">
                <span className={`inline-block text-xs px-2 py-0.5 rounded ${
                  order.estado === 'Completada'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {order.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
