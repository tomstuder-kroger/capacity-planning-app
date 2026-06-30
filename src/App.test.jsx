import { render, screen } from '@testing-library/react';
import App from './App';

test('renders PD Capacity Planner title', () => {
  render(<App />);
  const titleElement = screen.getByText(/PD Capacity Planner/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders Add Team Member button', () => {
  render(<App />);
  const buttonElement = screen.getByRole('button', { name: /Add Team Member/i });
  expect(buttonElement).toBeInTheDocument();
});
