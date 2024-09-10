import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import api from '../../services/api';

jest.mock('../../services/api');

// Mock component to test the useAuth hook
const TestComponent = () => {
  const { user, login, logout, register } = useAuth();
  return (
    <div>
      {user ? <p>Logged in as: {user.email}</p> : <p>Not logged in</p>}
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => register('test@example.com', 'username', 'password')}>Register</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('provides authentication state and methods', async () => {
    api.post.mockResolvedValueOnce({ data: { user: { email: 'test@example.com' }, token: 'fake-token' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Not logged in')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Logged in as: test@example.com')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Logout'));

    expect(screen.getByText('Not logged in')).toBeInTheDocument();
  });

  test('handles registration', async () => {
    api.post.mockResolvedValueOnce({ data: { user: { email: 'test@example.com' }, token: 'fake-token' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByText('Logged in as: test@example.com')).toBeInTheDocument();
    });
  });

  // Add more tests as needed
});
