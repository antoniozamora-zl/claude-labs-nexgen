import { render, screen } from '@testing-library/react';
import ReportsPage from './pages/ReportsPage';

test('renders reports page with heading and filters', () => {
  render(<ReportsPage />);
  expect(screen.getByText('Reportes')).toBeInTheDocument();
  expect(screen.getByText('Generar preview')).toBeInTheDocument();
  expect(screen.getByText('Tipo de reporte')).toBeInTheDocument();
  expect(screen.getByText('Fecha inicio')).toBeInTheDocument();
  expect(screen.getByText('Fecha fin')).toBeInTheDocument();
});
