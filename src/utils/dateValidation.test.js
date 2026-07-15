import { validateDateRange } from './dateValidation';

describe('validateDateRange', () => {
  test('returns valid for a correct date range', () => {
    const result = validateDateRange('2026-07-01', '2026-07-14');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('returns error when start date is empty', () => {
    const result = validateDateRange('', '2026-07-14');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/fecha de inicio/i);
  });

  test('returns error when end date is empty', () => {
    const result = validateDateRange('2026-07-01', '');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/fecha de fin/i);
  });

  test('returns error when start date is after end date', () => {
    const result = validateDateRange('2026-07-14', '2026-07-01');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/anterior/i);
  });

  test('returns valid when start equals end (same day report)', () => {
    const result = validateDateRange('2026-07-14', '2026-07-14');
    expect(result.valid).toBe(true);
  });

  test('returns error when range exceeds 365 days', () => {
    const result = validateDateRange('2025-01-01', '2026-07-01');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/365/);
  });

  test('returns valid for exactly 365 days range', () => {
    const result = validateDateRange('2025-07-15', '2026-07-14');
    expect(result.valid).toBe(true);
  });
});
