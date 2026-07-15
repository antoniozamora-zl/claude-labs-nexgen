const CLIENTES = ['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'Mesa 5', 'Mesa 6', 'Mesa 7', 'Mesa 8', 'Para llevar', 'Delivery'];
const ESTADOS = ['Completada', 'Completada', 'Completada', 'Completada', 'Cancelada'];
const ITEMS_MENU = [
  { nombre: 'Tacos al Pastor', precio: 85 },
  { nombre: 'Enchiladas Suizas', precio: 120 },
  { nombre: 'Pozole Rojo', precio: 95 },
  { nombre: 'Chiles Rellenos', precio: 110 },
  { nombre: 'Quesadillas', precio: 65 },
  { nombre: 'Agua de Horchata', precio: 35 },
  { nombre: 'Cerveza', precio: 55 },
  { nombre: 'Café de Olla', precio: 40 },
  { nombre: 'Flan Napolitano', precio: 60 },
  { nombre: 'Guacamole', precio: 75 },
];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateOrders() {
  const orders = [];
  const rand = seededRandom(42);
  let id = 1;

  for (let month = 0; month < 7; month++) {
    const daysInMonth = new Date(2026, month + 1, 0).getDate();
    const ordersThisMonth = Math.floor(rand() * 30) + 15;

    for (let i = 0; i < ordersThisMonth; i++) {
      const day = Math.floor(rand() * daysInMonth) + 1;
      const numItems = Math.floor(rand() * 5) + 1;
      const items = [];

      for (let j = 0; j < numItems; j++) {
        const item = ITEMS_MENU[Math.floor(rand() * ITEMS_MENU.length)];
        const qty = Math.floor(rand() * 3) + 1;
        items.push({ ...item, cantidad: qty });
      }

      const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

      orders.push({
        id: String(id).padStart(3, '0'),
        fecha: new Date(2026, month, day),
        cliente: CLIENTES[Math.floor(rand() * CLIENTES.length)],
        items,
        numItems: items.reduce((sum, item) => sum + item.cantidad, 0),
        total,
        estado: ESTADOS[Math.floor(rand() * ESTADOS.length)],
      });
      id++;
    }
  }

  return orders.sort((a, b) => b.fecha - a.fecha);
}

export const orders = generateOrders();

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getOrdersInRange(startDate, endDate) {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  end.setHours(23, 59, 59, 999);
  return orders.filter(o => o.fecha >= start && o.fecha <= end);
}

export function getSalesInRange(startDate, endDate) {
  const filtered = getOrdersInRange(startDate, endDate)
    .filter(o => o.estado === 'Completada');

  const salesByItem = {};
  filtered.forEach(order => {
    order.items.forEach(item => {
      if (!salesByItem[item.nombre]) {
        salesByItem[item.nombre] = { nombre: item.nombre, precio: item.precio, cantidadVendida: 0, ingresoTotal: 0 };
      }
      salesByItem[item.nombre].cantidadVendida += item.cantidad;
      salesByItem[item.nombre].ingresoTotal += item.precio * item.cantidad;
    });
  });

  return Object.values(salesByItem).sort((a, b) => b.ingresoTotal - a.ingresoTotal);
}

export const restaurantInfo = {
  nombre: 'Mi Restaurante',
  direccion: 'Av. Reforma 123, Col. Centro, CDMX',
  telefono: '55-1234-5678',
};
