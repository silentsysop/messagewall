import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({ user: null, loading: false }),
}));

test('renders EventChat link', () => {
  render(<App />);
  const linkElement = screen.getByText(/EventChat/i);
  expect(linkElement).toBeInTheDocument();
});
