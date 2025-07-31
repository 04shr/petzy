import { render, screen } from '@testing-library/react';
import App from './App';

test('renders petzy app', () => {
  render(<App />);
  const linkElement = screen.getByText(/Welcome to the Ultimate Pet Experience/i);
  expect(linkElement).toBeInTheDocument();
});