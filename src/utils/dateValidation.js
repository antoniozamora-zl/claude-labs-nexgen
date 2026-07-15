export function validateDateRange(startDate, endDate) {
  if (!startDate) {
    return { valid: false, error: 'La fecha de inicio es requerida' };
  }
  if (!endDate) {
    return { valid: false, error: 'La fecha de fin es requerida' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return { valid: false, error: 'La fecha de inicio debe ser anterior a la fecha de fin' };
  }

  const diffMs = end - start;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays > 365) {
    return { valid: false, error: 'El rango no puede exceder 365 dias' };
  }

  return { valid: true, error: null };
}
