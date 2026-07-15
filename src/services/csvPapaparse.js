import Papa from 'papaparse';
import { formatDate } from '../utils/dateFormatter';

function transformOrderRows(data) {
  return data.map(o => ({
    '#': o.id,
    Fecha: formatDate(o.fecha),
    Cliente: o.cliente,
    Items: o.numItems,
    Total: o.total,
    Estado: o.estado,
  }));
}

function transformSalesRows(data) {
  return data.map(item => ({
    Producto: item.nombre,
    'Precio unit.': item.precio,
    Cantidad: item.cantidadVendida,
    Ingreso: item.ingresoTotal,
  }));
}

export function generateCSV({ data, reportType, startDate, endDate }) {
  const isOrders = reportType === 'ordenes';
  const rows = isOrders ? transformOrderRows(data) : transformSalesRows(data);

  const csv = Papa.unparse(rows);

  const BOM = '\xEF\xBB\xBF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

  const fileName = `${isOrders ? 'ordenes' : 'ventas'}_${startDate}_${endDate}.csv`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
