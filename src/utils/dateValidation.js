export function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return { valid: false, error: 'Ambas fechas son requeridas' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return { valid: false, error: 'La fecha de inicio debe ser anterior a la fecha fin' };
  }

  const diffDays = (end - start) / (1000 * 60 * 60 * 24);
  if (diffDays > 365) {
    return { valid: false, error: 'El rango no puede exceder 365 días' };
  }

  return { valid: true, error: null };
}
