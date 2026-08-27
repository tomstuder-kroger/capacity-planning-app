import { render, screen } from '@testing-library/react';
import App from './App';

test('renders PD Capacity Planner title', () => {
  render(<App />);
  const titleElement = screen.getByText(/PD Capacity Planner/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders Add Member button', () => {
  render(<App />);
  const buttonElement = screen.getByRole('button', { name: /Add Member/i });
  expect(buttonElement).toBeInTheDocument();
});
