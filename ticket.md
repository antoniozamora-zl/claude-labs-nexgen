# Ticket: Adoption Week - Coordinated Work

## Status Board (shared between Claude instances)

### Instance A: TDD - Date Validation (feat/tdd-date-validation)
- [x] Write failing tests for date validation rules
- [x] Verify RED (4 tests fail, 3 pass)
- [x] Implement validation logic
- [x] Verify GREEN (7/7 pass)
- [x] Integrate into ReportFilters component
- [ ] Create draft PR

### Instance B: 3-PR Decision - CSV Export (feat/csv-export-*)
- [ ] Branch 1: csv-export-blob (client-side Blob/URL.createObjectURL)
- [ ] Branch 2: csv-export-papaparse (using papaparse library)
- [ ] Branch 3: csv-export-manual (manual string builder, zero deps)
- [ ] Compare and recommend in PR body

## Coordination Notes
- Base: main branch (merge feat/export-reports first)
- Instance A works on src/components/ReportFilters.jsx + tests
- Instance B works on src/services/ + new components
- No file conflicts expected

## Decision Log
- 2026-07-15: Starting parallel work on both tracks
