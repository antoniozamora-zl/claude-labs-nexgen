import { formatDate } from '../utils/dateFormatter';

function escapeCSV(value) {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildOrdersCSV(data) {
  const headers = ['#', 'Fecha', 'Cliente', 'Items', 'Total', 'Estado'];
  const rows = data.map(o => [
    o.id,
    formatDate(o.fecha),
    escapeCSV(o.cliente),
    o.numItems,
    o.total.toFixed(2),
    o.estado,
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function buildSalesCSV(data) {
  const headers = ['Producto', 'Precio unitario', 'Cantidad', 'Ingreso'];
  const rows = data.map(item => [
    escapeCSV(item.nombre),
    item.precio.toFixed(2),
    item.cantidadVendida,
    item.ingresoTotal.toFixed(2),
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function generateCSV({ data, reportType, startDate, endDate }) {
  const isOrders = reportType === 'ordenes';
  const csvContent = isOrders ? buildOrdersCSV(data) : buildSalesCSV(data);

  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const fileName = `${isOrders ? 'ordenes' : 'ventas'}_${startDate}_${endDate}.csv`;
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
