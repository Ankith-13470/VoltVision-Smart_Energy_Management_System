import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page content', () => {
  render(<App />);
  const heading = screen.getByText(/Energy insights for a sustainable campus future/i);
  expect(heading).toBeInTheDocument();
});
