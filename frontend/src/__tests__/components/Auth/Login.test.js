import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import Login from '../../../components/Auth/Login';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the api service
jest.mock('../../../services/api', () => ({
  post: jest.fn(),
}));

describe('Login Component', () => {
  const renderLogin = () => {
    render(
      <Router>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </Router>
    );
  };

  test('renders login form', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('allows entering email and password', () => {
    renderLogin();
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  // Add more tests for form submission, error handling, etc.
});
