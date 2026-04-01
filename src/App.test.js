import { render, screen } from '@testing-library/react';
import App from './App';

test('renders IC Capacity Planning title', () => {
  render(<App />);
  const titleElement = screen.getByText(/IC Capacity Planning/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders New IC button', () => {
  render(<App />);
  const buttonElement = screen.getByRole('button', { name: /New IC/i });
  expect(buttonElement).toBeInTheDocument();
});
