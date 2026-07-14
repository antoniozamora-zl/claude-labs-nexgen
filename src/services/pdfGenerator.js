import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { formatDate, formatCurrency } from '../utils/dateFormatter';
import { restaurantInfo } from '../data/mockData';

pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

const BRAND_COLOR = '#e94560';

function buildOrdersTable(data) {
  return {
    table: {
      headerRows: 1,
      widths: [30, 70, 80, 40, 70, 70],
      body: [
        [
          { text: '#', style: 'tableHeader' },
          { text: 'Fecha', style: 'tableHeader' },
          { text: 'Cliente', style: 'tableHeader' },
          { text: 'Items', style: 'tableHeader' },
          { text: 'Total', style: 'tableHeader' },
          { text: 'Estado', style: 'tableHeader' },
        ],
        ...data.map(o => [
          o.id,
          formatDate(o.fecha),
          o.cliente,
          String(o.numItems),
          formatCurrency(o.total),
          o.estado,
        ]),
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#e0e0e0',
      vLineColor: () => '#e0e0e0',
    },
  };
}

function buildSalesTable(data) {
  return {
    table: {
      headerRows: 1,
      widths: ['*', 80, 60, 80],
      body: [
        [
          { text: 'Producto', style: 'tableHeader' },
          { text: 'Precio unit.', style: 'tableHeader' },
          { text: 'Cantidad', style: 'tableHeader' },
          { text: 'Ingreso', style: 'tableHeader' },
        ],
        ...data.map(item => [
          item.nombre,
          formatCurrency(item.precio),
          String(item.cantidadVendida),
          formatCurrency(item.ingresoTotal),
        ]),
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#e0e0e0',
      vLineColor: () => '#e0e0e0',
    },
  };
}

export function generatePDF({ data, reportType, startDate, endDate }) {
  const isOrders = reportType === 'ordenes';
  const title = isOrders ? 'Reporte de Ordenes' : 'Reporte de Ventas';

  let summaryText;
  if (isOrders) {
    const completed = data.filter(o => o.estado === 'Completada');
    const totalIngreso = completed.reduce((sum, o) => sum + o.total, 0);
    const ticketPromedio = completed.length > 0 ? totalIngreso / completed.length : 0;
    summaryText = `Total ordenes: ${data.length}    |    Ingreso total: ${formatCurrency(totalIngreso)}    |    Ticket promedio: ${formatCurrency(ticketPromedio)}`;
  } else {
    const totalItems = data.reduce((sum, item) => sum + item.cantidadVendida, 0);
    const totalIngreso = data.reduce((sum, item) => sum + item.ingresoTotal, 0);
    summaryText = `Productos: ${data.length}    |    Unidades vendidas: ${totalItems}    |    Ingreso total: ${formatCurrency(totalIngreso)}`;
  }

  const docDefinition = {
    pageSize: 'LETTER',
    pageMargins: [40, 40, 40, 60],
    content: [
      {
        columns: [
          {
            canvas: [
              { type: 'rect', x: 0, y: 0, w: 40, h: 40, r: 6, color: BRAND_COLOR },
            ],
            width: 50,
          },
          {
            stack: [
              { text: restaurantInfo.nombre, fontSize: 18, bold: true, margin: [0, 0, 0, 2] },
              { text: `${restaurantInfo.direccion} | Tel: ${restaurantInfo.telefono}`, fontSize: 9, color: '#666' },
            ],
            width: '*',
            margin: [0, 2, 0, 0],
          },
        ],
        margin: [0, 0, 0, 10],
      },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: BRAND_COLOR }], margin: [0, 0, 0, 15] },
      { text: title, fontSize: 14, bold: true, margin: [0, 0, 0, 4] },
      { text: `Periodo: ${formatDate(startDate)} - ${formatDate(endDate)}`, fontSize: 10, color: '#666', margin: [0, 0, 0, 15] },
      isOrders ? buildOrdersTable(data) : buildSalesTable(data),
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#ddd' }], margin: [0, 15, 0, 10] },
      { text: summaryText, fontSize: 9, color: '#888', margin: [0, 0, 0, 10] },
      { text: `Generado el ${formatDate(new Date())} por EasyOrder`, fontSize: 8, color: '#aaa', alignment: 'center' },
    ],
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 9,
        color: 'white',
        fillColor: BRAND_COLOR,
      },
    },
    defaultStyle: {
      fontSize: 9,
    },
  };

  const fileName = `${isOrders ? 'ordenes' : 'ventas'}_${startDate}_${endDate}.pdf`;
  pdfMake.createPdf(docDefinition).download(fileName);
}
